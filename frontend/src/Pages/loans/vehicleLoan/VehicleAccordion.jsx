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

function VehicleLoan({ type, openAccordion, handleAccordionClick }) {
    const sections = {
        eligibility: [
            {
                heading: "Credit Score Requirements",
                content: "A credit score of 650+ significantly improves your approval chances for competitive interest rates. Our team works with applicants across all credit ranges, offering personalized solutions and guidance to strengthen your vehicle loan application.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Verification",
                content: "Salaried professionals need minimum monthly income of ₹15,000 with 2+ years employment history. Self-employed individuals require stable business operations for 3+ years with consistent income documentation.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Age and Employment Guidelines",
                content: "Applicants must be between 21-65 years at loan maturity. We offer flexible repayment terms from 1-7 years based on vehicle type and your financial profile for comfortable monthly payments.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Financial Assessment",
                content: "Our comprehensive analysis includes debt-to-income ratio, existing financial commitments, and vehicle affordability to ensure sustainable repayment throughout your loan tenure.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        documents: [
            {
                heading: "Identity and Address Proof",
                content: "Valid government-issued photo identification (Aadhaar, PAN, Passport, Driving License) and current address verification documents. We accept utility bills, bank statements, or rental agreements dated within the last 3 months.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Income Documentation",
                content: "Recent salary slips (3 months), Form 16, and bank statements (6 months) for salaried employees. Self-employed applicants need ITR (2 years), business financial statements, and comprehensive bank records (12 months).",
                icon: <IoDocumentTextOutline className="w-8 lg:w-8 h-7 lg:h-8" />,
            },
            {
                heading: "Vehicle Documentation",
                content: "Pro-forma invoice from authorized dealer, vehicle registration certificate (for used vehicles), insurance documents, and any existing loan closure certificates. Our team ensures thorough verification.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Additional Requirements",
                content: "Recent passport-size photographs, processing fee payment confirmation, and any lender-specific documentation. Our relationship managers provide complete guidance throughout the process.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        apply: [
            {
                heading: "Online Application",
                content: "Complete our streamlined digital application in under 10 minutes. Our user-friendly platform guides you through each step with real-time validation and helpful prompts for accurate information submission.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Quick Pre-Assessment",
                content: "Receive preliminary approval status within 30 minutes through our efficient evaluation system. Get indicative loan amount, interest rate options, and tenure recommendations tailored to your profile.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Document Processing",
                content: "Our dedicated team assists with document collection and verification. Advanced digital processing ensures accuracy and faster turnaround times for your vehicle loan application.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Approval and Disbursement",
                content: "Final loan approval typically completed within 24-48 hours. Funds are disbursed directly to the dealer with complete transparency. Track your application status through our portal.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
        ],
        offer: [
            {
                heading: "Competitive Interest Rates",
                content: "Access market-leading interest rates starting from 8.5% per annum for new vehicles. Choose between fixed and floating rate options based on your financial strategy and vehicle type.",
                icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Flexible Loan Amount",
                content: "Borrow up to 90% of vehicle's on-road price for new vehicles and 85% for used vehicles. Higher loan amounts available for premium vehicles and qualified applicants with excellent credit profiles.",
                icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Extended Repayment Terms",
                content: "Choose repayment tenure from 1-7 years with the flexibility to prepay without penalties after 12 months. Customize your EMI structure to match your financial planning and cash flow requirements.",
                icon: <IoMdContacts className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Value-Added Services",
                content: "Benefit from our comprehensive service package including vehicle valuation, insurance assistance, extended warranty options, and dedicated relationship management throughout your loan journey.",
                icon: <TbListDetails className="w-7 h-6 lg:w-6 lg:h-6" />,
            },
            {
                heading: "Quick Processing",
                content: "Experience industry-leading processing times with most applications approved within 24-48 hours. Our digital-first approach ensures minimal delays in your vehicle purchase journey.",
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
            "Here are the key requirements we evaluate for vehicle loan approval."
        ],
        documents: [
            "Our streamlined documentation process makes your application experience smooth.",
            "Here's what you'll need to have ready for a hassle-free vehicle loan process."
        ],
        apply: [
            "Follow our simple step-by-step application process designed for your convenience.",
            "From application to disbursement, we make your vehicle loan straightforward and transparent."
        ],
        offer: [
            "Discover the comprehensive benefits and features of our vehicle loan products.",
            "We're committed to providing value at every step of your vehicle financing journey."
        ]
    };

    const images = {
        eligibility: "/vehicleloanimg/Eligibility.png",
        documents: "/commonloanimg/documentrequired.png",
        apply: "/vehicleloanimg/apply.png",
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

export default function VehicleAccordion() { 
    const [openAccordion, setOpenAccordion] = useState(null);

    const handleAccordionClick = (key) => {
        setOpenAccordion(openAccordion === key ? null : key);
    };

    return (
        <div>
            <VehicleLoan type="eligibility" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <VehicleLoan type="documents" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <VehicleLoan type="apply" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <VehicleLoan type="offer" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
        </div>
    );
}
