import React, { useState } from "react";
import MapData from "./MapData";
import phone from "../assets/Dashboard/phone.png";
import phoneIcon from "../assets/Dashboard/phone-alt.png";
import ToiletsCount from "./ToiletsCount";
import ToiletDetails from "./ToiletDetails";
import CleanlinessReport from "./CleanlinessReport";
import FileStorageWrapper from "./FileStorageWrapper";
import IncidentReportAnalysis from "./IncidentReportAnalysis";
import VendorPerformance from "./VendorPerformance";
import MajorIssuesCount from "./MajorIssuesCount";
import { DICT } from "../utils/dictionary";

const SanitationDashboard = () => {
  const localLang = localStorage.getItem("lang");
  const [lang, setLang] = useState(localLang || "en");
  const props = { dict: DICT, lang: lang };
  return (
    <div className="grid grid-cols-4 mx-3 mt-3 gap-3 ">
      <div className="w-full border lg:col-span-1 col-span-4 shadow-md bg-white rounded-md">
        <ToiletsCount {...props}></ToiletsCount>
      </div>
      <div className="lg:col-span-3 col-span-4 border shadow-md bg-white rounded-md">
        <ToiletDetails {...props}></ToiletDetails>
      </div>
      <div className="col-span-4 shadow-md bg-white rounded-md">
        <MajorIssuesCount {...props}></MajorIssuesCount>
      </div>
      <div className="col-span-4 shadow-md bg-white rounded-md">
        <CleanlinessReport {...props}></CleanlinessReport>
      </div>

      {/* <div className="col-span-4 shadow-md bg-white rounded-md">
        <FileStorageWrapper {...props}></FileStorageWrapper>
      </div> */}
      <div className="col-span-4 md:col-span-2 shadow-md bg-white rounded-md">
        <IncidentReportAnalysis {...props}></IncidentReportAnalysis>
      </div>
      <div className="col-span-4 md:col-span-2 shadow-md bg-white rounded-md">
        <VendorPerformance {...props}></VendorPerformance>
      </div>
      <div className="col-span-4 shadow-md bg-white rounded-md">
        <MapData {...props}></MapData>
      </div>

      <div className="col-span-4 ">
        <div className="flex flex-col  shadow-md  sm:flex-row text-center mt-3 items-center border-2 border-orange-500 w-fit p-3 m-auto ">
          <span className="mr-8 text-xl font-semibold text-orange-400">
            Prayagraj Kumbh Mela{" "}
            <span className="text-orange-600 font-bold">Helpline No.</span>
          </span>
          <div className="flex items-center bg-orange-400 h-12">
            <div className="flex justify-center items-center">
              <img className="h-10 absolute" src={phone} alt="" />
              <img className="h-6 absolute" src={phoneIcon} alt="" />
            </div>
            <div className="ml-5 p-2 text-xl font-semibold text-white">
              01334-224 457
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SanitationDashboard;
