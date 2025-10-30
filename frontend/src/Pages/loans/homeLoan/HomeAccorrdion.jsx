import React, { useState, useEffect } from "react";
import {
    Accordion,
    AccordionHeader,
    AccordionBody,
} from "@material-tailwind/react";
import { BsSpeedometer2 } from "react-icons/bs";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoMdContacts } from "react-icons/io";
import { TbListDetails } from "react-icons/tb";
import { MdOutlineDataExploration } from "react-icons/md";
import "aos/dist/aos.css";
import AOS from "aos";

function HomeLoan({ type, openAccordion, handleAccordionClick }) {
    const sections = {
        eligibility: [
            {
                heading: "Credit Score Requirements",
                content: "A credit score of 700+ significantly improves your approval chances and helps secure better interest rates. Our team works with applicants across all credit ranges, offering personalized solutions and guidance to strengthen your application.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Verification",
                content: "Salaried professionals need 2+ years of consistent employment history, while self-employed individuals require 3+ years of stable business operations. We evaluate your complete financial profile for optimal loan structuring.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Age and Tenure Guidelines",
                content: "Applicants must be between 21-60 years at loan maturity (65 for self-employed). We offer flexible repayment terms up to 30 years, with some lenders providing extended options based on your profile.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Financial Assessment",
                content: "Our comprehensive analysis includes Fixed Obligations to Income Ratio (FOIR), existing commitments, and future financial goals to ensure comfortable repayment throughout your loan tenure.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        documents: [
            {
                heading: "Identity and Address Proof",
                content: "Valid government-issued photo identification (Aadhaar, PAN, Passport, Voter ID) and current address verification documents. We accept utility bills, bank statements, or rental agreements dated within the last 3 months.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Documentation",
                content: "Recent salary slips (3 months), Form 16, and bank statements (6 months) for salaried employees. Self-employed applicants need ITR (2 years), financial statements, and comprehensive bank records (12 months).",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Property Papers",
                content: "Complete property documentation including sale deed, approved building plans, NOC from builder, property tax receipts, and legal clearance certificates. Our legal team ensures thorough verification.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Additional Requirements",
                content: "Recent passport-size photographs, processing fee payment confirmation, and any lender-specific documentation. Our relationship managers provide complete guidance throughout the process.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        apply: [
            {
                heading: "Online Application",
                content: "Complete our streamlined digital application in under 10 minutes. Our user-friendly platform guides you through each step with real-time validation and helpful prompts for accurate information submission.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Quick Pre-Assessment",
                content: "Receive preliminary approval status within 30 minutes through our efficient evaluation system. Get indicative loan amount, interest rate options, and tenure recommendations tailored to your profile.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Document Processing",
                content: "Our dedicated team assists with document collection and verification. Advanced digital processing ensures accuracy and faster turnaround times for your loan application.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Approval and Disbursement",
                content: "Final loan approval typically completed within 24-48 hours. Funds are disbursed directly to the seller/builder with complete transparency. Track your application status through our portal.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        offer: [
            {
                heading: "Competitive Interest Rates",
                content: "Access market-leading interest rates starting from 8.35% per annum. Choose between fixed and floating rate options based on your financial strategy and risk preferences.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Flexible Loan Amount",
                content: "Borrow up to 90% of property value for ready-to-move properties and 80% for under-construction projects. Higher loan amounts available for premium properties and qualified applicants.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Extended Repayment Terms",
                content: "Choose repayment tenure up to 30 years with the flexibility to prepay without penalties. Customize your EMI structure to match your financial planning and cash flow requirements.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Value-Added Services",
                content: "Benefit from our comprehensive service package including property valuation, legal assistance, insurance guidance, and dedicated relationship management throughout your loan journey.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Tax Benefits",
                content: "Maximize your tax savings with deductions up to ₹1.5 lakh under Section 80C for principal repayment and ₹2 lakh under Section 24(b) for interest payments.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Quick Processing",
                content: "Experience industry-leading processing times with most applications approved within 24-48 hours. Our digital-first approach ensures minimal delays in your home buying journey.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
    };

    const titles = {
        eligibility: "Eligibility Criteria",
        documents: "Documents Required",
        apply: "Application Process",
        offer: "Loan Features & Benefits",
    };

    const descriptions = {
        eligibility: [
            "Understanding our eligibility criteria helps you prepare a strong application.",
            "Here are the key requirements we evaluate for loan approval."
        ],
        documents: [
            "Our streamlined documentation process makes your application experience smooth.",
            "Here's what you'll need to have ready for a hassle-free process."
        ],
        apply: [
            "Follow our simple step-by-step application process designed for your convenience.",
            "From application to disbursement, we make it straightforward and transparent."
        ],
        offer: [
            "Discover the comprehensive benefits and features of our home loan products.",
            "We're committed to providing value at every step of your home financing journey."
        ]
    };

    const images = {
        eligibility: "/homeloanimg/eligibility.png",
        documents: "/commonloanimg/documentrequired.png",
        apply: "/homeloanimg/apply.png",
        offer: "/commonloanimg/offer.png"
    };

    useEffect(() => {
        AOS.init({
            duration: 1000, 
            once: true, 
        });
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0 mt-2" id={type}>
            <div className="mt-[10px] lg:mt-[25px] mx-6 lg:ml-[120px]" data-aos="fade-right">
                <h1 className="text-[40px] md:ml-[10px] lg:text-[45px] font-bold heading">{titles[type]}</h1>
                <p className="text-[18px] md:ml-[10px] lg:text-[18px] text-white font-medium leading-[30px] lg:leading-[35px]">
                    {descriptions[type][0]}
                </p>
                <p className="text-[18px] md:ml-[10px] text-white lg:text-[18px] font-medium leading-[28px] lg:leading-[25px]">
                    {descriptions[type][1]}
                </p>
                <div className="mt-6 lg:mt-8 max-w-full lg:w-[80%] md:w-[80%] w-full">
                    {sections[type].map((section, index) => {
                        const accordionKey = `${type}-${index + 1}`;
                        return (
                            <Accordion
                                key={accordionKey}
                                open={openAccordion === accordionKey}
                                className={`rounded-xl mb-6 pb-2 transition-all duration-500 ease-in-out hover:scale-[1.03] hover:shadow-[0_0_12px_rgba(255,255,255,0.4)] ${openAccordion === accordionKey
                                    ? "border-b-[4px] border-auButtomColor"
                                    : "border-b-[4px] border-white"
                                } bg-auColor`}
                            >
                                <AccordionHeader
                                    onClick={() => handleAccordionClick(accordionKey)}
                                    className="px-6 pt-4 pb-2 font-medium cursor-pointer text-white flex justify-start items-center border-none"
                                >
                                    <div>{section.icon}</div>
                                    <h2 className="ml-4 lg:ml-5 text-[19px] md:text-[20px] font-bold">
                                        {section.heading}
                                    </h2>
                                </AccordionHeader>
                                <div
                                    style={{
                                        maxHeight: openAccordion === accordionKey ? "500px" : "0",
                                        overflow: "hidden",
                                        transition: "max-height 0.5s ease-in-out",
                                    }}
                                >
                                    <AccordionBody className="px-6 lg:px-16 pb-4 lg:pb-2 text-white text-[20px] lg:text-[17px]">
                                        {section.content}
                                    </AccordionBody>
                                </div>
                            </Accordion>
                        );
                    })}
                </div>
            </div>
            <div className="flex justify-center lg:justify-start" data-aos="fade-left">
                <img
                    src={images[type]}
                    alt={`${titles[type]} Illustration`}
                    className="mt-[30px] lg:mt-[160px] lg:ml-[90px] w-[370px] h-[320px] md:w-[480px] md:h-[380px] imgBorder my-4 rounded-lg hover:scale-[1.05] hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300 ease-out"
                />
            </div>
        </div>
    );
}

export default function HomeAccordion() { 
    const [openAccordion, setOpenAccordion] = useState(null);

    const handleAccordionClick = (key) => {
        setOpenAccordion(openAccordion === key ? null : key);
    };

    return (
        <div>
            <HomeLoan type="eligibility" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <HomeLoan type="documents" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <HomeLoan type="apply" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <HomeLoan type="offer" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
        </div>
    );
}
