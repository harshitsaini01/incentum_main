import React, { useState,useEffect } from "react";
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

function BusinessLoan({ type, openAccordion, handleAccordionClick }) {
    const sections = {
           eligibility: [
               {
                   heading: "Credit Score",
                   content: "720+ preferred. Some lenders may accept lesser scores.",
                   icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Business Vintage",
                   content: "At least 3 years of operation.",
                   icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Business CMR",
                   content: "A CIBIL MSME Rank (CMR) of no more than 6.",
                   icon: <IoMdContacts className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Age",
                   content: "21-60 years (salaried); up to 65 years (self-employed).",
                   icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Annual Income",
                   content: "Minimum of ₹1.5 Lakhs per year. Higher income increase loan amount.",
                   icon: <IoDocumentTextOutline className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Income Tax Returns",
                   content: "Filed for at least the past year. Regular return filing increase loan prospects.",
                   icon: <IoMdContacts className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
           ],
           documents: [
               {
                   heading: "Proof Of Identity",
                   content: "Government-issued identification like a passport, driver's license, or national ID.",
                   icon: <BsSpeedometer2 className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Proof Of Address",
                   content: "Documents like utility bills, rent agreements, or property tax receipts.",
                   icon: <IoDocumentTextOutline className="w-8 lg:w-8 h-7 lg:h-8" />,
               },
               {
                   heading: "Business Registration Proof",
                   content: "GST registration or incorporation certificate.",
                   icon: <TbListDetails className="w-7 h-6 lg:w-6  lg:h-6" />,
               },
               {
                   heading: "Financial Documents ",
                   content: "Audited statements and profit/loss records",
                   icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6"/>,
               },
               {
                   heading: "Bank statements ",
                   content: "Passbook statement of previous 6 months",
                   icon: <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6"/>,
               },
           ],
           apply:[
               {
                   heading: "Loan Amount",
                   content: "₹50,000-₹40cr, based on eligibility",
                   icon: (
                       <BsSpeedometer2 className="w-7 h-6 lg:w-6  lg:h-6" />
                   ),
               },
               {
                   heading: "Repayment Tenure",
                   content: "12-100 months",
                   icon: (
                     <IoDocumentTextOutline className="w-7 h-6 lg:w-6  lg:h-6" />
                   ),
               },
               
               {
                   heading: "Processing Fees",
                   content: "Up to 2.5% of the loan amount. May differ according to lenders",
                   icon: (
                     <TbListDetails className="w-7 h-6 lg:w-6  lg:h-6" />
       
                   ),
               },
               {
                   heading: "Pre-Payment Conditions",
                   content: "Allowed after 12 EMIs; some lenders waive charges for personal fund prepayments.",
                   icon: (
                     <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6"/>
                   ),
               },
               {
                   heading: "Other Charges",
                   content: "Includes processing fee, stamp duty, documentation fees etc., and GST as applicable.",
                   icon: (
                     <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6"/>
                   ),
               },
           ],
           offer:[
               {
                   heading: "Collateral-Free Loans",
                   content: "No need to pledge security or assets.",
                   icon: (
                       <BsSpeedometer2 className="w-7 h-6 lg:w-6  lg:h-6" />
                   ),
               },
               {
                   heading: "Large Loan Amounts",
                   content: "From ₹5 Lakhs to ₹75 Lakhs, with quick approval even for higher amounts",
                   icon: (
                     <IoDocumentTextOutline className="w-7 h-6 lg:w-6  lg:h-6" />
                   ),
               },
               {
                   heading: "Flexible Repayment Tenures",
                   content: "Choose repayment options that suit your financial situation.",
                   icon: (
                     <IoMdContacts className="w-7 h-6 lg:w-6  lg:h-6" />
                   ),
               },
               {
                   heading: "Fast Approval",
                   content: "Efficient processes ensure speedy disbursal.",
                   icon: (
                     <TbListDetails className="w-7 h-6 lg:w-6  lg:h-6" />
       
                   ),
               },
               {
                   heading: "Minimal Documentation",
                   content: "Simplify the paperwork and focus on your business",
                   icon: (
                     <MdOutlineDataExploration className="w-7 h-6 lg:w-6  lg:h-6"/>
                   ),
               },
           ],
       };

    const titles = {
        eligibility: "Eligibility Criteria",
        documents: "Documents Required",
        apply:"Loan Details and Charges",
        offer:"Why Choose INCENTUM?",
    };

    const descriptions = {
        eligibility: [
            "Am I Eligible? Let's Find Out Together!",
            "We believe in making dreams come true, but let's make sure we're ready for the loan.",
        ],
        documents: [
            "Documents You'll Need for Your Loan",
            "To make your loan process quick and easy, make sure you have the following.",
        ],
        apply:[
            "Loan should be stress-free, and we're here to make sure of that. Just follow these simple steps:"
        ],
        offer:[
            ""
        ]
    };

    const images = {
        eligibility: "/businessloanimg/eligibility.webp",
        documents: "/commonloanimg/documentrequired.png",
        apply:"/businessloanimg/apply.png",
        offer:"/commonloanimg/offer.png"
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

export default function BusinessAccordion() { 
    const [openAccordion, setOpenAccordion] = useState(null);

    const handleAccordionClick = (key) => {
        setOpenAccordion(openAccordion === key ? null : key);
    };

    return (
        <div>
            <BusinessLoan type="eligibility" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <BusinessLoan type="documents" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <BusinessLoan type="apply" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
            <BusinessLoan type="offer" openAccordion={openAccordion} handleAccordionClick={handleAccordionClick} />
        </div>
    );
}
