import React, { useState, useEffect, useRef } from "react";
import { Button, Table, Image, Divider } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import moment from "moment"; // For date formatting
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import html2pdf from "html2pdf.js";

import { getData } from "../Fetch/Axios";
import URLS from "../urils/URLS";
import { IMAGELIST } from "../assets/Images/exportImages";
import CoordinatesMap from "../commonComponents/map/map";

const MonitoringReport = () => {
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assetDetails, setAssetDetails] = useState({});
  const params = useParams();
  const navigate = useNavigate();
  const contentRef = useRef();

  // Fetch monitoring details from the API
  const getDetails = async () => {
    setLoading(true);
    const uri = `${URLS.monitoringDetails.path}${params.id}`;
    const extraHeaders = { "x-api-version": URLS.monitoringDetails.version };
    const res = await getData(uri, extraHeaders);

    if (res?.success && res.data?.monitoring?.length > 0) {
      const monitoringData = res.data.monitoring[0];
      // setDetails({ list: monitoringData.questions || [] });
      const myexcelData = monitoringData.questions?.map((data, index) => {
        return {
          sr: index + 1,
          question_en: data?.question_en,
          question_hi: data?.question_hi,
          description: data?.description,
          answer: data?.answer,
          image: data?.image,
        };
      });
      setDetails(myexcelData);

      setAssetDetails({
        asset_main_type_name: monitoringData?.asset_main_type_name || "N/A",
        vendor_name: monitoringData?.vendor_name || "N/A",
        sector_name: monitoringData?.sector_name || "N/A",
        circle_name: monitoringData?.circle_name || "N/A",
        latitude: monitoringData?.latitude || "N/A",
        longitude: monitoringData?.longitude || "N/A",
        remark: monitoringData?.remark || "No remarks",
        photo: monitoringData?.photo !== "N" ? monitoringData?.photo : null,
        asset_type_name: monitoringData?.asset_type_name || "",
        qrCode: monitoringData?.qr_code || null,
        code: monitoringData?.code || null,
        unit_no: monitoringData?.unit_no || "N/A",
        submitted_date: monitoringData?.updated_at
          ? moment(monitoringData?.updated_at).format("YYYY-MM-DD HH:mm:ss")
          : "N/A",
      });
    } else {
      setDetails([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    getDetails();
  }, [params]);

  // Table columns definition
  const dateColumns = [
    {
      title: "Sr No",
      dataIndex: "sr",
      key: "sr",
      width: "5%",
    },
    {
      title: "Question (EN)",
      dataIndex: "question_en",
      key: "question_en",
    },
    {
      title: "Question (HI)",
      dataIndex: "question_hi",
      key: "question_hi",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      render: (image) =>
        image !== "N" ? (
          <Image
            width={130}
            src={`${URLS.baseUrl}/${image}`}
            alt="Question Image"
          />
        ) : (
          "-"
        ),
      width: "15%",
    },
    {
      title: "Answer",
      dataIndex: "answer",
      key: "answer",
      render: (answer) => (
        <div
          className={`p-1 px-3 rounded-md flex w-fit text-xs ${
            answer === "1"
              ? "bg-green-500"
              : answer === "0"
              ? "bg-orange-500"
              : "bg-blue-200"
          }`}
        >
          {answer === "1" ? "Yes" : answer === "0" ? "No" : "Maintenance"}
        </div>
      ),
      width: "10%",
    },
  ];

  // excel
  const exportToExcel = async () => {
    if (details && details?.length > 0) {
      const excelList = details.map((data) => {
        const { image, answer, ...rest } = data;
        const modifiedAnswer = answer === "1" ? "Yes" : "No";
        return { ...rest, answer: modifiedAnswer };
      });
      const worksheet = XLSX.utils.json_to_sheet(excelList);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Monitoring Report");
      XLSX.writeFile(workbook, "MonitoringReport.xlsx");
    } else {
      return "";
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Centered ICT heading
    const ictHeading = "ICT Sanitation and Tentage Monitoring System";
    const pageWidth = doc.internal.pageSize.getWidth();
    const ictX = (pageWidth - doc.getTextWidth(ictHeading)) / 2; // Center the heading
    doc.setFontSize(14);
    doc.setFont("bold");
    doc.text(ictHeading, ictX, 10); // Heading position

    const leftImageX = 10; // X position (from the left)
    const leftImageY = 10; // Y position (from the top)
    const leftImageWidth = 30; // Image width (adjust as needed)
    const leftImageHeight = 25; // Image height (adjust as needed)
    doc.addImage(
      `${IMAGELIST?.govt_logo}`,
      "JPEG",
      leftImageX,
      leftImageY,
      leftImageWidth,
      leftImageHeight,
      undefined,
      undefined,
      "FAST" // Adds compression for smaller file size
    );

    const rightImageX = pageWidth - 40; // X position (from the right)
    const rightImageY = 10; // Y position (from the top)
    const rightImageWidth = 30; // Image width (adjust as needed)
    const rightImageHeight = 25; // Image height (adjust as needed)
    doc.addImage(
      // `${IMAGELIST?.kumbh}`,
      `${IMAGELIST?.govt_logo}`,
      "JPEG",
      rightImageX,
      rightImageY,
      rightImageWidth,
      rightImageHeight,
      undefined,
      undefined,
      "FAST" // Adds compression for smaller file size
    );

    // Add report title and date on the same line
    const title = "Monitoring Report";
    const date = new Date();
    const dateString = moment(date).format("DD-MMM-YYYY hh:mm A");
    // const dateString = date.toLocaleString(); // Format the date and time

    // Calculate positions for the title and date
    const titleX = 44; // Left align title
    const dateX = pageWidth - doc.getTextWidth(dateString) - 34; // 14 units from the right

    // Add title and date
    doc.setFontSize(12);
    doc.setFont("bold");
    doc.text(title, titleX, 25); // Title position
    doc.setFont("normal");
    doc.setFontSize(10); // Smaller font size for date
    doc.text(dateString, dateX, 25); // Date position

    // Add a horizontal line below the textBetweenImages, but only up to the edges of the images
    const lineStartX = leftImageX + leftImageWidth + 5; // Start after the left image
    const lineEndX = rightImageX - 5; // End before the right image
    doc.line(lineStartX, 30, lineEndX, 30); // x1, y1, x2, y2

    const str = assetDetails?.qrCode;
    const regex = /\/(\d+)\.png$/;
    const match = str.match(regex);

    // Table for dynamic fields (label-value pairs)
    const tableData = [
      ["Circle Name", `: ${assetDetails?.circle_name || ""}`],
      ["Sector Name", `: ${assetDetails?.sector_name || ""}`],
      ["Latitude", `: ${assetDetails?.latitude || ""}`],
      ["Longitude", `: ${assetDetails?.longitude || ""}`],
      [
        "Submitted  Date",
        `: ${
          moment(assetDetails?.updated_at).format("YYYY-MM-DD HH:mm:ss") || ""
        }`,
      ],
      ["Unit Number", `: ${assetDetails?.unit_no || ""}`],
      ["QR Code", `: ${match[1] || ""}`],
      ["Remark", `: ${assetDetails?.remark || ""}`],
      // Add more fields as needed
    ];

    // Add the first table (dynamic fields)
    doc.autoTable({
      startY: 40, // Start the table after the header
      body: tableData, // Table body
      theme: "plain", // Table style
      styles: {
        fontSize: 12,
        cellPadding: 3,
      },
      margin: { left: 10, right: 10 }, // Set margins
    });

    // Table header and content
    doc.autoTable({
      head: [["Sr", "Question (EN)", "Answer"]],
      // head: [["Sr", "Question (EN)", "Question (HI)", "Answer"]],
      body: details?.map((opt, index) => [
        index + 1,
        opt?.question_en,
        // opt?.question_hi,
        opt?.answer === "1" ? "Yes" : "No",
      ]),
      startY: 130, // Start after the header and new text
    });

    // Add footer
    const footerText1 = "Maha Kumbh Mela 2025, Prayagraj Mela Authority.";
    const footerX = (pageWidth - doc.getTextWidth(footerText1)) / 2; // Center footer
    const footerY = doc.internal.pageSize.getHeight() - 20; // 20 units from the bottom

    doc.setFontSize(10);
    doc.text(footerText1, footerX, footerY + 5); // Adjust for footer spacing

    // Save the PDF
    doc.save("Monitoring-Report.pdf");
  };

  const downloadPDF = () => {
    // Create an HTML table dynamically or have it in your JSX
    const tableHTML = `
      <div style="padding: 20px; margin-bottom: 30px;">
        <img 
          src="${IMAGELIST?.govt_logo}" 
          style="position: absolute; left: 20px; top: 5px; height: 90px; width: 90px; margin-left: 20px; margin-top: 20px;" 
        />
    
        <img 
          src="${IMAGELIST?.kumbhMela}" 
          style="position: absolute; right: 20px; top: 5px; height: 90px; width: 90px; margin-right: 20px; margin-top: 20px;" 
        />
    
        <h3 style="text-align: center; margin-bottom: 30px;">Maha Kumbh 2025</h3>
        <h5 style="text-align: center; margin-bottom: 30px;">ICT Sanitation and Tentage Monitoring System</h5>
    
        <!-- Vendor Info Table -->
        <div style="margin: 20px;">
          <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin-bottom: 20px;">
            <tbody>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 50%;"><strong>Category</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.asset_main_type_name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 50%;"><strong>Type</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.asset_type_name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd; width: 50%;"><strong>Vendor Name</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.vendor_name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Sector</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.sector_name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Circle</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.circle_name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>PTC ID</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${`${assetDetails?.code}-${assetDetails?.unit_no}`}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Submitted Date</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${moment(
                  assetDetails?.submitted_date
                ).format("DD-MMM-YYYY  hh:mm A")}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>Remark</strong></td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  assetDetails?.remark
                }</td>
              </tr>
            </tbody>
          </table>
        </div>
    
        <!-- Monitoring Report Table -->
        <div style="margin: 20px;">
          <h3 style="text-align: center; margin-bottom: 30px;">Monitoring Report</h3>
          <table style="width: 100%; border: 1px solid #ddd; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #187bcd; color:white">
                <th style=" padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Sr.</th>
                <th style=" padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Question (English)</th>
                <th style=" padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Question (Hindi)</th>
                <th style=" padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Answer</th>
              </tr>
            </thead>
            <tbody>
              ${details
                .map(
                  (item, index) => `
                    <tr style="background-color: ${
                      index % 2 === 0 ? "#f0f0f0" : "white"
                    };">
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                        index + 1
                      }</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                        item?.question_en || "N/A"
                      }</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: 'Noto Sans Devanagari', sans-serif;">${
                        item?.question_hi || "N/A"
                      }</td>
                      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                        item?.answer === "1" ? "Yes" : "No"
                      }</td>
                    </tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
  
       <!-- Instructions Section (Focused part) -->
        <div style="margin-top: 30px; font-size: 14px; line-height: 1.6; background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
          <strong>Instructions:</strong>
          <p>If non-compliance with Operation & Maintenance is found and not resolved within the specified TAT, then a penalty would be imposed as mentioned in RFP.</p>
        </div>
    
        <!-- Footer Text -->
        <div style="margin-top: 40px;">
          <hr style="border: 0; border-top: 2px solid black; margin-bottom: 10px;">
          <div style="text-align: center; font-size: 14px; color: #333;">
            Copyright © 2024-2025 Prayagraj Mela Authority. All Rights Reserved.
            <br>
            Hosted by Prayagraj Mela Authority.
          </div>
        </div>
      </div>
    `;

    // Create a hidden div for the content to be exported as PDF
    const element = document.createElement("div");
    element.innerHTML = tableHTML;

    // Set some general margin and padding styles for better spacing
    const styles = `
      @page {
        margin: 20mm;
      }
  
      .table-container {
        margin-bottom: 20px;
      }
  
      table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 20px;
      }
  
      td, th {
        // padding: 8px;
        border: 1px solid #ddd;
      }
  
      h1 {
        text-align: center;
      }
  
      .page-break {
        page-break-before: always;
      }
  
      /* Styling to ensure instructions section is not hidden or cut off */
      div {
        page-break-inside: avoid;
      }
    `;

    // Add styles to the page to handle margins, breaks, and other layout issues
    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    // Use html2pdf to generate the PDF with custom styles
    html2pdf().from(element).save("MonitoringReport.pdf");
  };

  return (
    <div>
      <div className="mx-auto p-3 pb-3 bg-white shadow-md rounded-lg w-full mt-3">
        <div className="flex items-center gap-2 font-semibold">
          <Button
            className="bg-gray-200 rounded-full w-9 h-9"
            onClick={() => navigate("/monitoring")}
          >
            <ArrowLeftOutlined />
          </Button>
          <div className="text-d9 text-2xl w-full flex items-end">
            <span className="mr-1">Monitoring Report For:</span>
            <span className="text-blue-500">
              {assetDetails?.asset_type_name}
            </span>
          </div>
          <div>
            <Button type="primary" onClick={downloadPDF}>
              {/* <Button type="primary" onClick={exportToPDF}> */}
              Download PDF
            </Button>
          </div>
          <div>
            <Button type="primary" onClick={exportToExcel}>
              Download Excel
            </Button>
          </div>
        </div>

        <Divider className="bg-d9 h-2/3 mt-1" />

        <div className="mt-3" ref={contentRef}>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <table
              style={{ borderCollapse: "collapse" }}
              className="w-full text-left"
            >
              <tbody>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Category
                  </td>
                  <td style={{ border: "none" }}>
                    : {assetDetails?.asset_main_type_name}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Type
                  </td>
                  <td style={{ border: "none" }}>
                    : {assetDetails?.asset_type_name}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Sector
                  </td>
                  <td style={{ border: "none" }}>
                    : {assetDetails?.sector_name}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Circle
                  </td>
                  <td style={{ border: "none" }}>
                    : {assetDetails?.circle_name}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Remark
                  </td>
                  <td style={{ border: "none" }}>:{assetDetails?.remark}</td>
                </tr>
              </tbody>
            </table>
            <table
              style={{ "border-collapse": "collapse" }}
              className="table-auto w-full text-left border-collapse border-none" // Apply border-none to table
            >
              <tbody>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Latitude
                  </td>
                  <td style={{ border: "none" }}>
                    : {` ${assetDetails?.latitude}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Longitude
                  </td>
                  <td style={{ border: "none" }}>
                    : {` ${assetDetails?.longitude}`}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Unit Number
                  </td>
                  <td style={{ border: "none" }}>: {assetDetails?.unit_no}</td>
                </tr>
                <tr>
                  <td style={{ border: "none" }} className="font-semibold">
                    Submitted Date
                  </td>
                  <td style={{ border: "none" }}>
                    :
                    {` ${moment(assetDetails?.submitted_date).format(
                      "DD-MMM-YYYY hh:mm A"
                    )}`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="flex justify-between mt-2 mb-3">
            <div className="flex flex-col text-center font-semibold">
              <span>QR Code</span>
              {assetDetails?.qrCode ? (
                <Image
                  width={130}
                  src={`${URLS.baseUrl}/${assetDetails?.qrCode}`}
                  alt="QR Code"
                />
              ) : (
                <span>No QR Code Available</span>
              )}
            </div>
            <div className="flex flex-col text-center font-semibold mt-6">
              <CoordinatesMap
                coordinates={[assetDetails?.longitude, assetDetails?.latitude]}
              />
            </div>
            <div className="flex flex-col text-center font-semibold">
              <span>Asset Image</span>
              {assetDetails?.photo ? (
                <Image
                  width={125}
                  height={125}
                  src={`${URLS.baseUrl}/${assetDetails?.photo}`}
                  alt="Asset"
                />
              ) : (
                <span>No Image Available</span>
              )}
            </div>
          </div>
        </div>
        {details?.length ? (
          <>
            <Table
              columns={dateColumns || []}
              dataSource={details}
              pagination={false}
              scroll={{ x: 1000, y: 350 }}
              bordered
              className="rounded-none"
              loading={loading}
            />
          </>
        ) : (
          <div className="mt-3 font-semibold text-orange-500 text-center">
            No Report Found
          </div>
        )}
      </div>
    </div>
  );
};

export default MonitoringReport;
