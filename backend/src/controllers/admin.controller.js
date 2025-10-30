const { Admin } = require("../models/authentication/Admin.models");
const { User } = require("../models/authentication/User.models");
const { LoanApplication } = require("../models/LoanApplication.model");
const Form = require("../models/individualForms/FormOne.model");
const { ApiError } = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const { asyncHandler } = require("../utils/asyncHandler");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Admin Registration (Only for creating initial admin or by super admin)
const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role = 'admin' } = req.body;

  // Check if admin already exists
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    throw new ApiError(400, "Admin with this email already exists");
  }

  // Create admin
  const admin = await Admin.create({
    name,
    email,
    password,
    role,
    createdBy: req.admin?._id, // If created by another admin
  });

  // Remove password from response
  const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  res.status(201).json(
    new ApiResponse(201, createdAdmin, "Admin registered successfully")
  );
});

// Admin Login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Check for default admin credentials
  const defaultEmail = process.env.ADMIN_EMAIL || "info@incentum.ai";
  const defaultPassword = process.env.ADMIN_PASSWORD || "Incentum!Business1";

  if (email === defaultEmail && password === defaultPassword) {
    // Create a temporary admin object for default admin
    const tempAdmin = {
      _id: "default-admin-id",
      name: process.env.ADMIN_NAME || "System Administrator",
      email: defaultEmail,
      role: "super_admin",
      permissions: ["read_applications", "update_applications", "manage_users", "view_statistics", "manage_admins"],
      isActive: true
    };

    // Generate token with admin ID
    const accessToken = jwt.sign(
      { id: tempAdmin._id, email: tempAdmin.email },
      process.env.ADMIN_ACCESS_TOKEN_SECRET || "fallback-secret",
      { expiresIn: "8h" }
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    };

    res
      .status(200)
      .cookie("adminToken", accessToken, options)
      .json(
        new ApiResponse(200, {
          admin: tempAdmin,
          accessToken,
        }, "Admin logged in successfully")
      );
    return;
  }

  // Find admin by email in database
  const admin = await Admin.findOne({ email, isActive: true });
  if (!admin) {
    throw new ApiError(401, "Invalid credentials");
  }

  // Check if account is locked
  if (admin.isLocked) {
    throw new ApiError(423, "Account is temporarily locked due to too many failed login attempts");
  }

  // Check password
  const isPasswordValid = await admin.isPasswordCorrect(password);
  if (!isPasswordValid) {
    await admin.incLoginAttempts();
    throw new ApiError(401, "Invalid credentials");
  }

  // Reset login attempts on successful login
  await admin.resetLoginAttempts();

  // Generate tokens
  const accessToken = admin.generateAccessToken();
  const refreshToken = admin.generateRefreshToken();

  // Save refresh token to database
  admin.refreshToken = refreshToken;
  await admin.save({ validateBeforeSave: false });

  // Remove password and refresh token from response
  const loggedInAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000, // 8 hours
  };

  res
    .status(200)
    .cookie("adminToken", accessToken, options)
    .json(
      new ApiResponse(200, {
        admin: loggedInAdmin,
        accessToken,
      }, "Admin logged in successfully")
    );
});

// Admin Logout
const logoutAdmin = asyncHandler(async (req, res) => {
  // Handle default admin case
  if (req.admin._id === "default-admin-id") {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    };

    return res
      .status(200)
      .clearCookie("adminToken", options)
      .json(new ApiResponse(200, {}, "Admin logged out successfully"));
  }

  // For database admin, clear refresh token
  await Admin.findByIdAndUpdate(
    req.admin._id,
    {
      $unset: {
        refreshToken: 1 // this removes the field from document
      }
    },
    {
      new: true
    }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  };

  return res
    .status(200)
    .clearCookie("adminToken", options)
    .json(new ApiResponse(200, {}, "Admin logged out successfully"));
});

// Get Current Admin Profile
const getCurrentAdmin = asyncHandler(async (req, res) => {
  // Handle default admin case
  if (req.admin._id === "default-admin-id") {
    res.status(200).json(
      new ApiResponse(200, req.admin, "Admin profile retrieved successfully")
    );
    return;
  }

  const admin = await Admin.findById(req.admin._id).select("-password -refreshToken");
  
  if (!admin) {
    throw new ApiError(404, "Admin not found");
  }

  res.status(200).json(
    new ApiResponse(200, admin, "Admin profile retrieved successfully")
  );
});

// Dashboard Statistics
const getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalApplications = await LoanApplication.countDocuments();
    const totalAdmins = await Admin.countDocuments({ isActive: true });

    // Get application statistics
    const applicationStats = await LoanApplication.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Get loan type statistics
    const loanTypeStats = await LoanApplication.aggregate([
      {
        $group: {
          _id: "$loanType",
          count: { $sum: 1 },
          totalAmount: { $sum: "$loanAmount" }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await LoanApplication.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('applicationId loanType loanAmount status createdAt userId');

    // Get monthly statistics
    const monthlyStats = await LoanApplication.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          applications: { $sum: 1 },
          totalAmount: { $sum: "$loanAmount" }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    // Get user registration statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          users: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalApplications,
        totalAdmins,
        pendingApplications: applicationStats.find(s => s._id === 'submitted')?.count || 0,
        approvedApplications: applicationStats.find(s => s._id === 'approved')?.count || 0,
        rejectedApplications: applicationStats.find(s => s._id === 'rejected')?.count || 0,
      },
      applicationsByStatus: applicationStats,
      loanTypeStats,
      recentApplications,
      monthlyStats,
      userStats
    };

    res.status(200).json(
      new ApiResponse(200, stats, "Dashboard statistics retrieved successfully")
    );
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new ApiError(500, "Failed to fetch dashboard statistics");
  }
});

const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phoneNumber: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select("-password -refreshToken")
    .sort({ [sortBy]: sortOrder })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalUsers = await User.countDocuments(query);

  res.status(200).json(
    new ApiResponse(200, {
      users,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      totalUsers
    }, "Users retrieved successfully")
  );
});

// Get All Loan Applications
const getAllLoanApplications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status || '';
  const loanType = req.query.loanType || '';
  const search = req.query.search || '';
  const sortBy = req.query.sortBy || 'createdAt';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

  // First try LoanApplication model
  const loanQuery = {};
  if (status) loanQuery.status = status;
  if (loanType) loanQuery.loanType = loanType;
  if (search) {
    loanQuery.$or = [
      { applicationId: { $regex: search, $options: 'i' } },
      { 'personalDetails.fullName': { $regex: search, $options: 'i' } },
      { 'personalDetails.email': { $regex: search, $options: 'i' } }
    ];
  }

  const loanApplications = await LoanApplication.find(loanQuery)
    .populate('userId', 'name email phoneNumber')
    .sort({ [sortBy]: sortOrder })
    .lean();

  console.log('🔍 Admin - Found loan applications:', loanApplications.length);
  if (loanApplications.length > 0) {
    console.log('🔍 Admin - First application structure:', {
      id: loanApplications[0]._id,
      hasPersonalDetails: !!loanApplications[0].personalDetails,
      personalDetailsKeys: loanApplications[0].personalDetails ? Object.keys(loanApplications[0].personalDetails) : 'none',
      hasEmploymentDetails: !!loanApplications[0].employmentDetails,
      employmentDetailsKeys: loanApplications[0].employmentDetails ? Object.keys(loanApplications[0].employmentDetails) : 'none',
      hasLoanSpecificDetails: !!loanApplications[0].loanSpecificDetails,
      loanSpecificDetailsKeys: loanApplications[0].loanSpecificDetails ? Object.keys(loanApplications[0].loanSpecificDetails) : 'none'
    });
  }

  // Then try Form model
  const formQuery = {};
  if (status) formQuery.status = status;
  if (loanType) formQuery['loanApplication.loanType'] = loanType;
  if (search) {
    formQuery.$or = [
      { 'personalDetails.full_name': { $regex: search, $options: 'i' } },
      { 'personalDetails.email_id': { $regex: search, $options: 'i' } }
    ];
  }

  const formApplications = await Form.find(formQuery)
    .populate('user', 'name email phoneNumber')
    .sort({ [sortBy]: sortOrder })
    .lean();

  // Combine and normalize the results
  const allApplications = [
    ...loanApplications.map(app => ({
      ...app,
      applicationId: app.applicationId || app._id,
      loanType: app.loanType,
      loanAmount: app.loanSpecificDetails?.loanAmountRequired || 0,
      userId: app.userId
    })),
    ...formApplications.map(form => ({
      ...form,
      applicationId: form._id,
      loanType: form.loanApplication?.loanType || 'N/A',
      loanAmount: form.loanApplication?.loan_amount_required || 0,
      userId: form.user
    }))
  ];

  // Sort combined results
  allApplications.sort((a, b) => {
    if (sortOrder === 1) {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });

  // Paginate
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedApplications = allApplications.slice(startIndex, endIndex);

  res.status(200).json(
    new ApiResponse(200, {
      applications: paginatedApplications,
      totalPages: Math.ceil(allApplications.length / limit),
      currentPage: page,
      totalApplications: allApplications.length
    }, "Loan applications retrieved successfully")
  );
});

// Get Single Application by ID
const getApplicationById = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  console.log('🔍 Admin - Fetching application by ID:', applicationId);

  // Try to find in both LoanApplication and Form models
  let application = await LoanApplication.findById(applicationId)
    .populate('userId', 'name email phoneNumber');

  if (application) {
    console.log('🔍 Admin - Found application in LoanApplication model:', {
      id: application._id,
      loanType: application.loanType,
      status: application.status,
      hasPersonalDetails: !!application.personalDetails,
      personalDetailsKeys: application.personalDetails ? Object.keys(application.personalDetails) : 'none',
      personalDetailsData: application.personalDetails,
      hasEmploymentDetails: !!application.employmentDetails,
      employmentDetailsKeys: application.employmentDetails ? Object.keys(application.employmentDetails) : 'none',
      employmentDetailsData: application.employmentDetails,
      hasLoanSpecificDetails: !!application.loanSpecificDetails,
      loanSpecificDetailsKeys: application.loanSpecificDetails ? Object.keys(application.loanSpecificDetails) : 'none',
      loanSpecificDetailsData: application.loanSpecificDetails
    });
  }

  if (!application) {
    console.log('🔍 Admin - Not found in LoanApplication, trying Form model');
    // Try to find in Form model
    application = await Form.findById(applicationId)
      .populate('user', 'name email phoneNumber');
      
    if (application) {
      console.log('🔍 Admin - Found application in Form model');
    }
  }

  if (!application) {
    console.log('❌ Admin - Application not found in either model');
    throw new ApiError(404, "Application not found");
  }

  console.log('✅ Admin - Sending application response');
  res.status(200).json(
    new ApiResponse(200, application, "Application details retrieved successfully")
  );
});

// Serve Document File
const serveDocument = asyncHandler(async (req, res) => {
  const { applicationId, documentId } = req.params;
  try {
    console.log(`Serving document: applicationId=${applicationId}, documentId=${documentId}`);
    let application = await LoanApplication.findById(applicationId);
    let form = null;
    if (!application) {
      form = await Form.findById(applicationId);
    }
    if (!application && !form) {
      throw new ApiError(404, "Application not found");
    }
    let documentPath = null;
    let documentName = null;
    let foundDoc = null;

    // 1. Search in LoanApplication model's main documents
    if (application && application.documents && application.documents.length > 0) {
      foundDoc = application.documents.find(d => d._id.toString() === documentId);
      if (foundDoc) {
        documentPath = foundDoc.filePath || foundDoc.path;
        documentName = foundDoc.fileName || foundDoc.filename || foundDoc.originalname;
        console.log(`Found document in LoanApplication.documents: ${documentPath}`);
      }
    }
    
    // 2. If not found, search in Form model's loanDocuments
    if (!foundDoc && form && form.loanDocuments && form.loanDocuments.length > 0) {
      foundDoc = form.loanDocuments.find(d => d._id.toString() === documentId);
      if (foundDoc) {
        documentPath = foundDoc.filePath || foundDoc.path;
        documentName = foundDoc.fileName || foundDoc.filename || foundDoc.originalname;
        console.log(`Found document in Form.loanDocuments: ${documentPath}`);
      }
    }

    // 3. If not found, search within coApplicants documents (for LoanApplication model)
    if (!foundDoc && application && application.coApplicants && application.coApplicants.length > 0) {
        for (const coApplicant of application.coApplicants) {
            if (coApplicant.documents && coApplicant.documents.length > 0) {
                foundDoc = coApplicant.documents.find(d => d._id.toString() === documentId);
                if (foundDoc) {
                    documentPath = foundDoc.filePath || foundDoc.path;
                    documentName = foundDoc.fileName || foundDoc.filename || foundDoc.originalname;
                    console.log(`Found document in coApplicant.documents: ${documentPath}`);
                    break;
                }
            }
        }
    }
    
    if (!documentPath) {
      console.log(`Document not found by ID: ${documentId} for application ${applicationId}`);
      throw new ApiError(404, "Document not found");
    }
    
    const fs = require('fs');
    const path = require('path');
    const cleanPath = documentPath.replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), cleanPath);
    
    console.log(`Attempting to access file: ${fullPath}`);
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found on disk: ${fullPath}`);
      throw new ApiError(404, "Document file not found on server");
    }
    
    const stats = fs.statSync(fullPath);
    const fileExtension = path.extname(fullPath).toLowerCase();
    
    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      contentType = 'application/msword';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${documentName || path.basename(fullPath)}"`);
    
    console.log(`Streaming file: ${fullPath} (${stats.size} bytes)`);
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error serving document:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to serve document");
  }
});

// Download Application as PDF - MODERN REDESIGN
const downloadApplicationPDF = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  let application = await LoanApplication.findById(applicationId)
    .populate('userId', 'name email phoneNumber')
    .lean();

  let isFormModel = false;
  if (!application) {
    application = await Form.findById(applicationId)
      .populate('user', 'name email phoneNumber')
      .lean();
    isFormModel = true;
  }

  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  console.log('PDF Generation - Application data:', {
    hasDocuments: !!application.documents,
    documentsCount: application.documents?.length || 0,
    hasCoApplicants: !!application.coApplicants,
    coApplicantsCount: application.coApplicants?.length || 0,
    coApplicantsWithDocs: application.coApplicants?.filter(ca => ca.documents && ca.documents.length > 0).length || 0
  });

  const doc = new PDFDocument({ 
    margin: 50,
    size: 'A4',
    bufferPages: true,
    info: {
      Title: `Loan Application - ${application.applicationId || application._id}`,
      Author: 'Incentum Financial Services',
      Subject: 'Loan Application Document',
      Keywords: 'loan, application, finance, incentum'
    }
  });
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="Loan-Application-${application.applicationId || application._id}.pdf"`);
  doc.pipe(res);

  // Modern Color Palette
  const primary = '#1e3a8a';
  const accent = '#f59e0b';
  const success = '#10b981';
  const danger = '#ef4444';
  const dark = '#1f2937';
  const light = '#f3f4f6';
  const white = '#ffffff';

  const safe = (val) => (val === null || val === undefined || val === '' || val === 'N/A') ? null : String(val);
  const currency = (val) => {
    const num = typeof val === 'number' ? val : parseFloat(val);
    return isNaN(num) ? null : `₹${num.toLocaleString('en-IN')}`;
  };
  const dateFormat = (val) => {
    try { return val ? new Date(val).toLocaleDateString('en-IN') : null; } 
    catch { return val; }
  };

  const pageCheck = (space = 50) => {
    if (doc.y > 750) { doc.addPage(); modernHeader(); }
  };

  const modernHeader = () => {
    doc.rect(0, 0, doc.page.width, 100).fill(primary);
    doc.rect(0, 100, doc.page.width, 3).fill(accent);
    
    doc.fillColor(white).fontSize(28).font('Helvetica-Bold').text('INCENTUM', 50, 25);
    doc.fontSize(11).font('Helvetica').text('Financial Services Pvt. Ltd.', 50, 58);
    
    doc.circle(doc.page.width - 70, 50, 25).lineWidth(3).stroke(accent);
    doc.fillColor(accent).fontSize(8).font('Helvetica-Bold')
       .text('OFFICIAL', doc.page.width - 90, 43, { width: 40, align: 'center' });
    doc.fontSize(7).text('REPORT', doc.page.width - 90, 55, { width: 40, align: 'center' });
    
    doc.y = 120;
  };

  const sectionTitle = (text) => {
    pageCheck();
    doc.rect(50, doc.y, 4, 20).fill(accent);
    doc.fillColor(dark).fontSize(14).font('Helvetica-Bold').text(text, 62, doc.y + 3);
    doc.y += 28;
  };

  const infoBox = (label, value, highlight = false) => {
    const val = safe(value);
    if (!val) return;
    pageCheck();
    
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#6b7280').text(label, 50, doc.y);
    doc.fontSize(10).font('Helvetica').fillColor(highlight ? accent : dark)
       .text(val, 200, doc.y, { width: 350 });
    doc.y += 18;
  };

  const twoCol = (l1, v1, l2, v2) => {
    const val1 = safe(v1), val2 = safe(v2);
    if (!val1 && !val2) return;
    pageCheck();
    
    const y = doc.y;
    if (val1) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#6b7280').text(l1, 50, y);
      doc.fontSize(9).font('Helvetica').fillColor(dark).text(val1, 140, y, { width: 140 });
    }
    if (val2) {
      doc.fontSize(8).font('Helvetica-Bold').fillColor('#6b7280').text(l2, 300, y);
      doc.fontSize(9).font('Helvetica').fillColor(dark).text(val2, 390, y, { width: 160 });
    }
    doc.y += 18;
  };

  modernHeader();

  const statusMap = {
    'approved': { color: success, text: ' APPROVED' },
    'rejected': { color: danger, text: ' REJECTED' },
    'pending': { color: '#6b7280', text: ' PENDING' },
    'submitted': { color: primary, text: ' SUBMITTED' },
    'under_review': { color: accent, text: ' UNDER REVIEW' }
  };
  
  const status = statusMap[(application.status || 'pending').toLowerCase()] || statusMap.pending;
  doc.roundedRect(50, doc.y, 250, 45, 8).fill(status.color);
  doc.fillColor(white).fontSize(16).font('Helvetica-Bold')
     .text(status.text, 60, doc.y + 15);
  
  const appId = application.applicationId || application._id.toString().substring(0, 10);
  doc.roundedRect(320, doc.y, 230, 45, 8).fill(light);
  doc.fillColor('#6b7280').fontSize(9).font('Helvetica-Bold').text('APPLICATION ID', 330, doc.y + 10);
  doc.fillColor(dark).fontSize(13).font('Helvetica-Bold').text(appId, 330, doc.y + 25);
  
  doc.y += 60;

  sectionTitle('APPLICATION OVERVIEW');
  
  const loanType = isFormModel 
    ? (application.loanApplication?.loanType || 'N/A')
    : (application.loanType || 'N/A');
  const loanAmount = isFormModel
    ? (application.loanApplication?.loan_amount_required)
    : (application.loanSpecificDetails?.loanAmountRequired || application.loanAmount);
  
  twoCol('Loan Type', loanType, 'Priority', application.priority || 'Standard');
  twoCol('Submitted On', dateFormat(application.createdAt), 'Last Updated', dateFormat(application.updatedAt));
  infoBox('Requested Amount', currency(loanAmount), true);
  if (application.approvedAmount) {
    infoBox('Approved Amount', currency(application.approvedAmount), true);
  }
  doc.y += 15;

  if (isFormModel && application.personalDetails && application.personalDetails.length > 0) {
    application.personalDetails.forEach((pd, idx) => {
      sectionTitle(idx === 0 ? 'PRIMARY APPLICANT' : `CO-APPLICANT ${idx}`);
      
      infoBox('Full Name', pd.full_name, true);
      infoBox('Father\'s Name', pd.father_name);
      twoCol('Mobile', pd.mobile_number, 'Email', pd.email_id);
      twoCol('Date of Birth', pd.dob, 'Gender', pd.gender);
      twoCol('Marital Status', pd.marital_status, 'Dependents', pd.no_of_dependents);
      twoCol('Qualification', pd.qualification, 'Employment', pd.employment_type);
      if (pd.marital_status?.toLowerCase() === 'married' && pd.spouse_employment_type) {
        infoBox('Spouse Employment', pd.spouse_employment_type);
      }
      twoCol('PAN', pd.pan_number?.toUpperCase(), 'Citizenship', pd.citizenship);
      infoBox('Residence Type', pd.residence_type);
      
      if (pd.permanent_address || pd.present_address) {
        doc.y += 8;
        doc.fontSize(10).font('Helvetica-Bold').fillColor(accent).text('Address Information', 50, doc.y);
        doc.y += 18;
        
        if (pd.permanent_address) {
          const addr = [pd.permanent_address, pd.permanent_district, pd.permanent_state, 
                       pd.permanent_pincode ? `PIN: ${pd.permanent_pincode}` : null].filter(Boolean).join(', ');
          infoBox('Permanent', addr);
        }
        if (pd.present_address) {
          const addr = [pd.present_address, pd.present_district, pd.present_state, 
                       pd.present_pincode ? `PIN: ${pd.present_pincode}` : null].filter(Boolean).join(', ');
          infoBox('Present', addr);
        }
      }
      
      if (application.loanApplication?.applicants && application.loanApplication.applicants[idx]) {
        const emp = application.loanApplication.applicants[idx];
        
        if (emp.user_type === 'Salaried' && emp.salariedDetails) {
          doc.y += 10;
          doc.fontSize(10).font('Helvetica-Bold').fillColor(accent).text('Employment (Salaried)', 50, doc.y);
          doc.y += 18;
          
          const s = emp.salariedDetails;
          infoBox('Organisation', s.organisation_name, true);
          twoCol('Type', s.organisation_type, 'Designation', s.designation_salaried);
          twoCol('Current Exp.', s.currentOrganizationExperience, 'Previous Exp.', s.previousOrganizationExperience);
          twoCol('Posting Location', s.place_of_posting, 'Salary Bank', s.salary_bank_name);
          infoBox('Monthly Salary', currency(s.monthly_salary), true);
        }
        
        if (emp.user_type === 'Self-Employed' && emp.selfEmployedDetails) {
          doc.y += 10;
          doc.fontSize(10).font('Helvetica-Bold').fillColor(accent).text('Business Details', 50, doc.y);
          doc.y += 18;
          
          const b = emp.selfEmployedDetails;
          infoBox('Company', b.company_name, true);
          twoCol('Type', b.company_type, 'Designation', b.designation_self);
          twoCol('Incorporation', b.incorporation_date, 'Years Active', b.years_in_business);
          infoBox('ITR Filing Years', b.years_of_itr_filing);
        }
      }
      doc.y += 20;
    });
    
    if (application.loanApplication) {
      sectionTitle('LOAN DETAILS');
      const la = application.loanApplication;
      infoBox('Loan Amount', currency(la.loan_amount_required), true);
      if (la.property_address) infoBox('Property Address', la.property_address);
      if (la.property_finalised || la.agreement_executed) {
        twoCol('Property Finalised', la.property_finalised, 'Agreement Executed', la.agreement_executed);
      }
      if (la.agreement_mou_value) infoBox('Agreement Value', currency(la.agreement_mou_value));
      if (la.preferred_banks) infoBox('Preferred Banks', la.preferred_banks, true);
      doc.y += 15;
    }
    
    if (application.loanDocuments && application.loanDocuments.length > 0) {
      application.loanDocuments.forEach((docs, dIdx) => {
        sectionTitle(`DOCUMENTS - ${dIdx === 0 ? 'Primary' : `Co-Applicant ${dIdx}`}`);
        
        const fields = ['panCard', 'aadharCard', 'employerIDCard', 'joiningConfirmationExperienceLetter', 
          'last12MonthSalaryAccountStatement', 'latest6MonthSalarySlip', 'form16PartABAnd26AS', 
          'itrAndComputation', 'firmRegistrationCertificate', 'gstrLastYear', 'balanceSheets', 
          'nocLoanCloseStatements', 'drivingLicense', 'kycProprietorPartnersDirectors', 
          'certificateForIncorporation'];
        
        let cnt = 0;
        fields.forEach(k => {
          if (docs[k]) {
            pageCheck();
            cnt++;
            doc.fontSize(8).font('Helvetica').fillColor('#6b7280')
               .text(`• ${k.replace(/([A-Z])/g, ' $1').trim()}`, 50, doc.y, { width: 400 });
            doc.fontSize(8).fillColor(success).text('✓', 460, doc.y);
            doc.y += 14;
          }
        });
        if (cnt === 0) {
          doc.fontSize(9).fillColor('#9ca3af').text('No documents', 50, doc.y);
        }
        doc.y += 15;
      });
    }
  } else {
    const u = application.userId || application.user;
    
    if (u || application.personalDetails) {
      sectionTitle('APPLICANT INFORMATION');
      if (u) {
        infoBox('Name', u.name, true);
        twoCol('Email', u.email, 'Phone', u.phoneNumber);
      }
      
      const pd = application.personalDetails;
      if (pd) {
        if (pd.fullName && !u) infoBox('Name', pd.fullName, true);
        twoCol('Date of Birth', dateFormat(pd.dateOfBirth), 'Gender', pd.gender);
        twoCol('Qualification', pd.qualification, 'Employment', pd.employmentType);
        twoCol('PAN', pd.panNumber?.toUpperCase(), 'Residence', pd.residenceType);
        
        if (pd.permanentAddress) {
          const a = pd.permanentAddress;
          infoBox('Permanent Address', [a.address, a.district, a.state, a.pinCode].filter(Boolean).join(', '));
        }
      }
      doc.y += 15;
    }

    if (application.loanSpecificDetails && Object.keys(application.loanSpecificDetails).length > 0) {
      sectionTitle('LOAN DETAILS');
      const ld = application.loanSpecificDetails;
      infoBox('Amount Required', currency(ld.loanAmountRequired), true);
      if (ld.propertyAddress) infoBox('Property', ld.propertyAddress);
      if (ld.vehicleMake) twoCol('Vehicle', ld.vehicleMake, 'Model', ld.vehicleModel);
      if (ld.preferredBanks?.length) infoBox('Preferred Banks', ld.preferredBanks.join(', '));
      doc.y += 15;
    }

    if (application.employmentDetails && Object.keys(application.employmentDetails).length > 0) {
      sectionTitle('EMPLOYMENT');
      const e = application.employmentDetails;
      if (e.organisationName) {
        infoBox('Organisation', e.organisationName, true);
        twoCol('Type', e.organisationType, 'Designation', e.designation);
        infoBox('Monthly Salary', currency(e.monthlySalary), true);
      }
      if (e.firmName) {
        infoBox('Firm', e.firmName, true);
        twoCol('Type', e.firmType, 'Years Active', e.yearsInBusiness);
      }
      doc.y += 15;
    }

    if (application.documents?.length > 0) {
      doc.addPage();
      sectionTitle('MAIN APPLICANT DOCUMENTS');
      
      application.documents.forEach((d, i) => {
        // Document title - use fileName if documentType is missing
        const docTitle = d.documentType || d.type || d.fileName || 'Document';
        doc.fontSize(11).fillColor(dark).font('Helvetica-Bold')
           .text(`${docTitle}`, 50, doc.y);
        doc.y += 20;
        
        // Try to embed the document
        try {
          const docPath = d.filePath || d.path || d.filename;
          console.log('Processing main applicant document:', { docPath, documentType: d.documentType });
          
          if (docPath) {
            const cleanPath = docPath.replace(/^\/+/, '');
            const fullPath = path.join(process.cwd(), cleanPath);
            console.log('Full path:', fullPath);
            
            if (fs.existsSync(fullPath)) {
              const fileExtension = path.extname(fullPath).toLowerCase();
              const fileName = d.fileName || d.filename || d.originalname || path.basename(fullPath);
              
              if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                try {
                  if (doc.y > 600) {
                    doc.addPage();
                        doc.y = 120;
                  }
                  
                  doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                  doc.y += 15;
                  
                  doc.image(fullPath, 50, doc.y, { 
                    fit: [495, 400],
                    align: 'center'
                  });
                  doc.y += 410;
                  
                  console.log('Image embedded successfully');
                } catch (imgErr) {
                  console.error('Error embedding image:', imgErr);
                  doc.fontSize(9).fillColor('#ef4444').text(`✗ Could not embed image: ${fileName}`, 50, doc.y);
                  doc.y += 20;
                }
              } else if (fileExtension === '.pdf') {
                // For PDFs, show file info and note
                doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                doc.y += 15;
                doc.fontSize(9).fillColor('#f59e0b').text('📄 PDF Document (Original file attached separately)', 50, doc.y);
                doc.y += 15;
                doc.fontSize(8).fillColor('#6b7280').text(`Size: ${(fs.statSync(fullPath).size / 1024).toFixed(1)} KB`, 50, doc.y);
                doc.y += 25;
              } else {
                // For other file types
                doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                doc.y += 15;
                doc.fontSize(9).fillColor('#6b7280').text(`✓ Document uploaded (${fileExtension.replace('.', '').toUpperCase()} format)`, 50, doc.y);
                doc.y += 25;
              }
            } else {
              doc.fontSize(9).fillColor('#ef4444').text(`✗ Document file not found on server`, 50, doc.y);
              doc.y += 25;
              console.error('File not found:', fullPath);
            }
          } else {
            doc.fontSize(9).fillColor('#6b7280').text(`✓ Document uploaded (path unavailable)`, 50, doc.y);
            doc.y += 25;
          }
        } catch (err) {
          console.error('Error processing document:', err);
          doc.fontSize(9).fillColor('#ef4444').text(`✗ Error processing document`, 50, doc.y);
          doc.y += 25;
        }
        
        // Add spacing between documents
        doc.y += 15;
      });
    }

    // Co-applicant documents
    if (application.coApplicants?.length > 0) {
      application.coApplicants.forEach((coApp, coIndex) => {
        if (coApp.documents && coApp.documents.length > 0) {
          doc.addPage();
          sectionTitle(`CO-APPLICANT ${coIndex + 1} DOCUMENTS`);
          
            coApp.documents.forEach((d, i) => {
              const docTitle = d.documentType || d.type || d.fileName || 'Document';
              doc.fontSize(11).fillColor(dark).font('Helvetica-Bold')
                 .text(`${docTitle}`, 50, doc.y);
              doc.y += 20;
            
            try {
              const docPath = d.filePath || d.path || d.fileName || d.filename;
              console.log(`Processing co-applicant ${coIndex + 1} document:`, { 
                docPath, 
                documentType: d.documentType,
                allDocFields: {
                  filePath: d.filePath,
                  path: d.path,
                  fileName: d.fileName,
                  filename: d.filename
                }
              });
              
              if (docPath) {
                const cleanPath = docPath.replace(/^\/+/, '');
                const fullPath = path.join(process.cwd(), cleanPath);
                console.log('Full path:', fullPath);
                
                if (fs.existsSync(fullPath)) {
                  const fileExtension = path.extname(fullPath).toLowerCase();
                  const fileName = d.fileName || d.filename || d.originalname || path.basename(fullPath);
                  
                  if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
                    try {
                      if (doc.y > 600) {
                        doc.addPage();
                        doc.y = 120;
                      }
                      
                      doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                      doc.y += 15;
                      
                      doc.image(fullPath, 50, doc.y, { 
                        fit: [495, 400],
                        align: 'center'
                      });
                      doc.y += 410;
                      
                      console.log('Co-applicant image embedded successfully');
                    } catch (imgErr) {
                      console.error('Error embedding co-applicant image:', imgErr);
                      doc.fontSize(9).fillColor('#ef4444').text(`✗ Could not embed image: ${fileName}`, 50, doc.y);
                      doc.y += 20;
                    }
                  } else if (fileExtension === '.pdf') {
                    doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                    doc.y += 15;
                    doc.fontSize(9).fillColor('#f59e0b').text('📄 PDF Document (Original file attached separately)', 50, doc.y);
                    doc.y += 15;
                    doc.fontSize(8).fillColor('#6b7280').text(`Size: ${(fs.statSync(fullPath).size / 1024).toFixed(1)} KB`, 50, doc.y);
                    doc.y += 25;
                  } else {
                    doc.fontSize(8).fillColor('#6b7280').text(`File: ${fileName}`, 50, doc.y);
                    doc.y += 15;
                    doc.fontSize(9).fillColor('#6b7280').text(`✓ Document uploaded (${fileExtension.replace('.', '').toUpperCase()} format)`, 50, doc.y);
                    doc.y += 25;
                  }
                } else {
                  doc.fontSize(9).fillColor('#ef4444').text(`✗ Document file not found on server`, 50, doc.y);
                  doc.y += 25;
                  console.error('Co-applicant file not found:', fullPath);
                }
              } else {
                console.log('Co-applicant document path unavailable. Full document object:', JSON.stringify(d, null, 2));
                doc.fontSize(9).fillColor('#f59e0b').text(`⚠ Document was uploaded but file path not saved in database`, 50, doc.y);
                doc.y += 15;
                doc.fontSize(8).fillColor('#6b7280').text(`This document needs to be re-uploaded to appear in PDF reports`, 50, doc.y);
                doc.y += 25;
              }
            } catch (err) {
              console.error('Error processing co-applicant document:', err);
              doc.fontSize(9).fillColor('#ef4444').text(`✗ Error processing document`, 50, doc.y);
              doc.y += 25;
            }
            
            doc.y += 15;
          });
        }
      });
    }
  }

  if (application.statusHistory?.length > 0) {
    sectionTitle('HISTORY');
    application.statusHistory.forEach(h => {
      pageCheck();
      doc.fontSize(8).fillColor('#6b7280').text(`${dateFormat(h.date || h.updatedAt)}:`, 50, doc.y);
      doc.fontSize(9).fillColor(dark).font('Helvetica-Bold').text(h.status.toUpperCase(), 130, doc.y);
      if (h.remarks) doc.fontSize(8).fillColor(dark).text(h.remarks, 220, doc.y, { width: 330 });
      doc.y += 16;
    });
    doc.y += 15;
  }

  doc.y = 720;
  doc.rect(0, doc.y, doc.page.width, 122).fill(primary);
  doc.fillColor(white).fontSize(18).font('Helvetica-Bold')
     .text('INCENTUM FINANCIAL SERVICES', 50, doc.y + 20, { align: 'center' });
  doc.fontSize(10).font('Helvetica').text('Official Loan Application Report', 50, doc.y + 45, { align: 'center' });
  doc.fontSize(8).text(`Generated: ${new Date().toLocaleDateString('en-IN')} | info@incentum.ai`, 50, doc.y + 70, { align: 'center' });
  doc.fontSize(7).fillColor(accent).text('Confidential Document', 50, doc.y + 90, { align: 'center' });
  
  doc.end();
});

const updateLoanApplicationStatus = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const { status, comments, approvedAmount } = req.body;

  if (!['submitted', 'in_progress', 'under_review', 'approved', 'rejected', 'pending', 'disbursed'].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  // Try to find in LoanApplication model first
  let application = await LoanApplication.findById(applicationId);
  let isFormModel = false;
  
  if (!application) {
    // Try Form model
    application = await Form.findById(applicationId);
    isFormModel = true;
  }
  
  if (!application) {
    throw new ApiError(404, "Loan application not found");
  }

  // Update status
  application.status = status;
  application.lastModified = new Date();

  // If status is approved and approvedAmount is provided, set it
  if (status === 'approved' && approvedAmount !== undefined) {
    if (approvedAmount < 0) {
      throw new ApiError(400, "Approved amount cannot be negative");
    }
    const requestedAmount = isFormModel 
      ? (application.loanApplication?.loan_amount_required || 0)
      : (application.loanAmount || 0);
    
    if (approvedAmount > requestedAmount) {
      throw new ApiError(400, "Approved amount cannot exceed requested amount");
    }
    application.approvedAmount = approvedAmount;
  }

  // Add status history if the model supports it
  if (application.statusHistory) {
    application.statusHistory.push({
      status,
      date: new Date(),
      updatedBy: req.admin._id,
      comments
    });
  }

  // Add comment if provided and model supports it
  if (comments && application.comments) {
    application.comments.push({
      comment: comments,
      commentBy: req.admin._id,
      commentDate: new Date()
    });
  }

  await application.save();

  res.status(200).json(
    new ApiResponse(200, application, "Loan application status updated successfully")
  );
});

// Update Application by ID
const updateApplicationById = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;
  const updateData = req.body;

  // Remove fields that shouldn't be updated
  delete updateData.userId;
  delete updateData.user;
  delete updateData.applicationId;
  delete updateData.createdAt;
  delete updateData._id;

  // Try to find and update in LoanApplication model first
  let application = await LoanApplication.findById(applicationId);
  
  if (application) {
    // Update LoanApplication
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        application[key] = updateData[key];
      }
    });
    
    application.lastModifiedAt = new Date();
    await application.save();
    
    // Add to status history
    application.statusHistory.push({
      status: application.status,
      date: new Date(),
      updatedBy: req.admin._id,
      comments: 'Updated by admin'
    });
    
    await application.save();
  } else {
    // Try Form model
    application = await Form.findById(applicationId);
    if (!application) {
      throw new ApiError(404, "Application not found");
    }
    
    // Update Form
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        application[key] = updateData[key];
      }
    });
    
    await application.save();
  }

  res.status(200).json(
    new ApiResponse(200, application, "Application updated successfully")
  );
});

// Create Default Admin (for initial setup)
const createDefaultAdmin = asyncHandler(async (req, res) => {
  const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (existingAdmin) {
    throw new ApiError(400, "Default admin already exists");
  }

  const admin = await Admin.create({
    name: process.env.ADMIN_NAME || "System Administrator",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: 'super_admin',
    permissions: ['read_applications', 'update_applications', 'manage_users', 'view_statistics', 'manage_admins']
  });

  const createdAdmin = await Admin.findById(admin._id).select("-password -refreshToken");

  res.status(201).json(
    new ApiResponse(201, createdAdmin, "Default admin created successfully")
  );
});

// Download Individual Document
const downloadDocument = asyncHandler(async (req, res) => {
  const { applicationId, documentType, applicantIndex } = req.params;
  
  try {
    console.log(`Downloading document: applicationId=${applicationId}, documentType=${documentType}, applicantIndex=${applicantIndex}`);
    
    // Try to find in both models
    let application = await LoanApplication.findById(applicationId);
    let form = null;
    
    if (!application) {
      form = await Form.findById(applicationId);
    }
    
    if (!application && !form) {
      throw new ApiError(404, "Application not found");
    }
    
    let documentPath = null;
    const applicantIdx = parseInt(applicantIndex) || 0;
    
    // Handle Form model documents (supports multiple applicants)
    if (form && form.loanDocuments && form.loanDocuments.length > 0) {
      console.log(`Form model found with ${form.loanDocuments.length} document sets`);
      if (applicantIdx < form.loanDocuments.length) {
        const applicantDocs = form.loanDocuments[applicantIdx];
        documentPath = applicantDocs[documentType];
        console.log(`Document path for applicant ${applicantIdx}: ${documentPath}`);
      }
    } 
    // Handle LoanApplication model documents
    else if (application) {
      console.log(`LoanApplication model found`);
      
      if (applicantIdx === 0 && application.documents && application.documents.length > 0) {
        // Main applicant documents
        const doc = application.documents.find(d => d.type === documentType);
        if (doc) {
          documentPath = doc.filename;
          console.log(`Main applicant document found: ${documentPath}`);
        }
      } else if (applicantIdx > 0 && application.coApplicants && application.coApplicants.length > (applicantIdx - 1)) {
        // Co-applicant documents (applicantIndex is 1-based for co-applicants)
        const coApplicant = application.coApplicants[applicantIdx - 1];
        if (coApplicant.documents && coApplicant.documents.length > 0) {
          const doc = coApplicant.documents.find(d => d.documentType === documentType);
          if (doc) {
            documentPath = doc.fileName;
            console.log(`Co-applicant ${applicantIdx - 1} document found: ${documentPath}`);
          }
        }
      }
    }
    
    if (!documentPath) {
      console.log(`Document not found: ${documentType} for applicant ${applicantIdx}`);
      throw new ApiError(404, "Document not found");
    }
    
    // Construct full file path
    const fs = require('fs');
    const path = require('path');
    
    // Remove any leading slash and ensure proper path
    const cleanPath = documentPath.replace(/^\/+/, '');
    const fullPath = path.join(process.cwd(), cleanPath);
    
    console.log(`Attempting to access file: ${fullPath}`);
    
    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      console.log(`File not found on disk: ${fullPath}`);
      throw new ApiError(404, "Document file not found on server");
    }
    
    // Get file stats
    const stats = fs.statSync(fullPath);
    const fileExtension = path.extname(fullPath).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    if (fileExtension === '.pdf') {
      contentType = 'application/pdf';
    } else if (['.jpg', '.jpeg'].includes(fileExtension)) {
      contentType = 'image/jpeg';
    } else if (fileExtension === '.png') {
      contentType = 'image/png';
    } else if (['.doc', '.docx'].includes(fileExtension)) {
      contentType = 'application/msword';
    }
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `attachment; filename="${documentType}-applicant-${applicantIdx + 1}-${path.basename(fullPath)}"`);
    
    console.log(`Streaming file: ${fullPath} (${stats.size} bytes)`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullPath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading document:', error);
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, "Failed to download document");
  }
});



// Delete user
const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Find and delete the user
  const user = await User.findByIdAndDelete(userId);
  
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  res.status(200).json(
    new ApiResponse(200, { deletedUser: user }, "User deleted successfully")
  );
});

// Delete application
const deleteApplication = asyncHandler(async (req, res) => {
  const { applicationId } = req.params;

  // Try to find and delete from LoanApplication model first
  let application = await LoanApplication.findByIdAndDelete(applicationId);
  
  // If not found, try the Form model
  if (!application) {
    application = await Form.findByIdAndDelete(applicationId);
  }
  
  if (!application) {
    throw new ApiError(404, "Application not found");
  }

  res.status(200).json(
    new ApiResponse(200, { deletedApplication: application }, "Application deleted successfully")
  );
});

module.exports = {
  registerAdmin,
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  getDashboardStats,
  getAllUsers,
  getAllLoanApplications,
  updateLoanApplicationStatus,
  getApplicationById,
  updateApplicationById,
  downloadApplicationPDF,
  createDefaultAdmin,
  downloadDocument,
  serveDocument,
  deleteUser,
  deleteApplication
}; 