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

function MortgageLoan({ type, openAccordion, handleAccordionClick }) {
    const sections = {
        eligibility: [
            {
                heading: "Credit Score Requirements",
                content: "A credit score of 700+ significantly improves your approval chances and helps secure better interest rates. Strong credit history demonstrates financial responsibility and increases loan-to-value ratio eligibility.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Verification",
                content: "Salaried professionals need stable income with 2+ years employment history. Self-employed individuals require 3+ years of consistent business operations with audited financial statements.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Property Evaluation",
                content: "Property must have clear title, proper documentation, and legal compliance. We accept residential, commercial, and industrial properties with valid approvals and NOCs.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Age and Employment Guidelines",
                content: "Applicants must be between 21-60 years for salaried employees and up to 65 years for self-employed individuals. We evaluate complete financial profile and repayment capacity.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        documents: [
            {
                heading: "Identity and Address Proof",
                content: "Valid government-issued photo identification (Aadhaar, PAN, Passport, Voter ID) and current address verification documents. We accept utility bills, bank statements, or rental agreements dated within the last 3 months.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Documentation",
                content: "Recent salary slips (3 months), Form 16, appointment letter, and bank statements (6 months) for salaried employees. Self-employed applicants need ITR (2 years), business financial statements, and comprehensive bank records (12 months).",
                icon: <IoDocumentTextOutline className="w-8 lg:w-8 h-7 lg:h-8" />,
            },
            {
                heading: "Property Documents",
                content: "Complete property documentation including title deed, sale agreement, approved building plans, NOC from builder, property tax receipts, and legal clearance certificates. Our legal team ensures thorough verification.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Valuation and Legal Documents",
                content: "Property valuation report, legal opinion, encumbrance certificate, and survey settlement records. Our empaneled valuers and legal experts ensure comprehensive property assessment.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        apply: [
            {
                heading: "Property Assessment",
                content: "Complete our comprehensive property evaluation form including property details, valuation requirements, and loan purpose. Our experts analyze property value and legal compliance.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Financial Evaluation",
                content: "Receive detailed financial assessment within 48 hours through our specialized mortgage evaluation team. Get indicative loan amount, interest rates, and customized repayment options.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Documentation and Verification",
                content: "Our dedicated mortgage specialists assist with document collection, property verification, and legal compliance checks. Streamlined process ensures accuracy and faster approval times.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Approval and Disbursement",
                content: "Final loan approval typically completed within 48-72 hours after documentation. Funds are disbursed as per agreed terms with complete transparency and tracking capabilities.",
                icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        offer: [
            {
                heading: "Competitive Interest Rates",
                content: "Access market-leading interest rates starting from 9.5% per annum. Choose between fixed and floating rate options based on your financial strategy and property type.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "High Loan-to-Value Ratio",
                content: "Borrow up to 50-60% of property's market value for residential properties and up to 50% for commercial properties. Higher LTV available for premium properties and qualified applicants.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Extended Repayment Terms",
                content: "Choose repayment tenure from 5-20 years with flexible EMI options. Customize your repayment schedule to match your financial planning and cash flow requirements.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Flexible Usage Options",
                content: "Use funds for business expansion, debt consolidation, working capital, or personal requirements. No restrictions on end-use with property as collateral security.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Comprehensive Support Services",
                content: "Benefit from our complete service package including property valuation, legal assistance, documentation support, and dedicated relationship management throughout your loan journey.",
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
            "Here are the key requirements we evaluate for mortgage loan approval."
        ],
        documents: [
            "Our streamlined documentation process makes your application experience smooth.",
            "Here's what you'll need to have ready for a hassle-free mortgage loan process."
        ],
        apply: [
            "Follow our simple step-by-step application process designed for your convenience.",
            "From application to disbursement, we make your mortgage loan straightforward and transparent."
        ],
        offer: [
            "Discover the comprehensive benefits and features of our mortgage loan products.",
            "We're committed to providing value at every step of your property financing journey."
        ]
    };

    const images = {
        eligibility: "/personalloanimg/Eligibility.webp",
        documents: "/commonloanimg/documentrequired.png",
        apply: "/personalloanimg/apply.webp",
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

export default function MortgageAccordion() { 
    const [openAccordion, setOpenAccordion] = useState(null);

    const handleAccordionClick = (key) => {
        setOpenAccordion(openAccordion === key ? null : key);
    };

    return (
        <div>
            <MortgageLoan type="eligibility" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <MortgageLoan type="documents" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <MortgageLoan type="apply" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <MortgageLoan type="offer" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
        </div>
    );
}
