import React, { useEffect, useState } from "react";
import { Button, Modal, Table } from "antd";
import CommonTable from "../../../commonComponents/CommonTable";
import CommonDivider from "../../../commonComponents/CommonDivider";
import URLS from "../../../urils/URLS";
import { useNavigate, useParams } from "react-router";
import { getData } from "../../../Fetch/Axios";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setUpdateVendorDetailsEl,
  setVendorDetailsListIsUpdated,
} from "./vendorDetailsSlice";

const VendorDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();

  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({
    list: [],
    pageLength: 25,
    currentPage: 1,
    totalRecords: 0,
  });

  const [proposedSectors, setProposedSectors] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [userName, setUserName] = useState("");

  const isUpdatedSelector = useSelector(
    (state) => state.vendorDetailsUpdateEl?.isUpdated
  );

  const columns = [
    {
      title: "Sr. No",
      dataIndex: "sr",
      key: "sr",
      width: 80,
    },
    {
      title: "Category",
      dataIndex: "asset_main_type_name",
      key: "main_type",
    },
    {
      title: "Toilets & Tentage Type",
      dataIndex: "asset_type_name",
      key: "asset_type",
      width: 300,
    },
    {
      title: "Contract Number",
      dataIndex: "contract_number",
      key: "contract_number",
      width: 160,
    },
    {
      title: "Work Order Number",
      dataIndex: "work_order_number",
      key: "work_order_number",
      width: 180,
    },
    {
      title: "Allotted Quantity",
      dataIndex: "total_allotted_quantity",
      key: "total_allotted_quantity",
    },
    {
      title: "Proposed Sectors & Parking",
      dataIndex: "proposedsectors",
      key: "proposed_sectors",
      render: (text, record) => (
        <div
          onClick={() => handleProposedSectorsView(text, record)}
          className="text-blue-500 cursor-pointer"
        >
          View
        </div>
      ),
    },
    {
      title: "Manager Contact 1",
      dataIndex: "manager_contact_1",
      key: "manager_contact_1",
      width: 160,
    },
    {
      title: "Manager Contact 2",
      dataIndex: "manager_contact_2",
      key: "manager_contact_2",
      width: 160,
    },
    {
      title: "Date of Allocation",
      dataIndex: "date_of_allocation",
      key: "date_of_allocation",
      width: 160,
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      fixed: "right",
      width: 80,
      render: (text, record) => (
        <Button
          className="bg-blue-100 border-blue-500 focus:ring-blue-500 hover:bg-blue-200 rounded-full"
          onClick={() => {
            const newObject = Object.keys(record)
              .filter((key) => key !== "action") // Filter out 'action'
              .reduce((obj, key) => {
                obj[key] = record[key]; // Rebuild the object without 'action'
                return obj;
              }, {});
            dispatch(setUpdateVendorDetailsEl({ updateElement: record }));
            navigate(`/vendor/add-vendor-details-form/${params?.id}`, {
              state: {
                key: "UpdateKey",
                record: newObject, // Pass the record as part of the state
              },
            });
          }}
        >
          <EditOutlined />
        </Button>
      ),
    },
  ];

  const handleProposedSectorsView = (data, record) => {
    setProposedSectors(record);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setProposedSectors([]);
  };

  const getDetails = async () => {
    setLoading(true);
    let uri = URLS.vendorDetails.path + params.id + "&";

    if (params.page) uri += params.page;
    if (params.per_page) uri += "&" + params.per_page;

    const res = await getData(uri, {
      "x-api-version": URLS.vendorDetails.version,
    });

    if (res) {
      const data = res.data;
      setLoading(false);
      setUserName(data.userdetails[0]?.user_name);

      const list = data.userdetails.map((el, index) => ({
        ...el,
        sr: index + 1,
        action: (
          <Button
            className="bg-blue-100 border-blue-500 focus:ring-blue-500 hover:bg-blue-200 rounded-full"
            key={el.name + index}
            onClick={() => {
              dispatch(setUpdateVendorDetailsEl({ updateElement: el }));
              navigate("/vendor/add-vendor-details-form/" + params.id);
            }}
          >
            <EditOutlined />
          </Button>
        ),
      }));

      setDetails({
        list,
        pageLength: data.paging[0].length,
        currentPage: data.paging[0].currentPage,
        totalRecords: data.paging[0].totalrecords,
      });
    }
  };

  useEffect(() => {
    dispatch(setUpdateVendorDetailsEl({ updateElement: null }));
  }, [dispatch]);

  useEffect(() => {
    if (params.id) {
      getDetails();
      if (isUpdatedSelector) {
        dispatch(setVendorDetailsListIsUpdated({ isUpdated: false }));
      }
    } else {
      navigate("/vendor");
    }
  }, [params, isUpdatedSelector, dispatch, navigate]);

  const totalAllottedQuantity = details.list
    .reduce(
      (total, item) => total + Number(item.total_allotted_quantity || 0),
      0
    )
    .toLocaleString(); // Convert to digit format with commas

  return (
    <div>
      <div className="flex gap-2 items-center">
        <Link to="/vendor">
          <Button className="bg-gray-200 rounded-full w-9 h-9">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <div className="w-full">
          <CommonDivider
            label={
              <div>
                Vendor Details For{" "}
                <span className="text-blue-500">{userName}</span>
              </div>
            }
            compo={
              <Button
                className="bg-orange-300 mb-1"
                onClick={() =>
                  // navigate("/vendor/add-vendor-details-form/" + params.id)
                  navigate(`/vendor/add-vendor-details-form/${params?.id}`, {
                    state: {
                      key: "AddKey",
                    },
                  })
                }
              >
                Add Details
              </Button>
            }
          />
        </div>
      </div>

      <CommonTable
        columns={columns}
        uri={"vendor/add-vendor-details/" + params.id}
        details={details}
        loading={loading}
      />

      <div className="text-right font-semibold mt-2">
        Total Allotted Quantity: {totalAllottedQuantity}
      </div>

      <Modal
        title={`Proposed Sectors & Parking`}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        {proposedSectors?.proposedsectors?.length ? (
          <>
            <Table
              bordered
              dataSource={proposedSectors?.proposedsectors}
              rowKey="sector_name"
              className="mb-4"
              pagination={false}
              scroll={{ x: 300, y: 400 }}
              columns={[
                {
                  title: "Sector Name",
                  dataIndex: "sector_name",
                  key: "sector_name",
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                },
              ]}
            />
          </>
        ) : (
          <p>No sectors found for this asset type.</p>
        )}
        {proposedSectors?.proposedparkings?.length ? (
          <>
            <Table
              bordered
              className="mb-4"
              dataSource={proposedSectors?.proposedparkings}
              rowKey="sector_name"
              pagination={false}
              scroll={{ x: 300, y: 400 }}
              columns={[
                {
                  title: "Parking Name",
                  dataIndex: "parking_name",
                  key: "parking_name",
                },
                {
                  title: "Quantity",
                  dataIndex: "quantity",
                  key: "quantity",
                },
              ]}
            />
          </>
        ) : (
          <p>No Parking found for this asset type.</p>
        )}
        {(proposedSectors?.proposedsectors?.length ||
          proposedSectors?.proposedparkings?.length) && (
          <div className="text-right font-semibold mt-2">
            Total Quantity:{" "}
            {(
              proposedSectors?.proposedparkings?.reduce(
                (total, park) => total + Number(park?.quantity || 0),
                0
              ) +
              proposedSectors?.proposedsectors?.reduce(
                (total, sector) => total + Number(sector?.quantity || 0),
                0
              )
            ).toLocaleString()}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default VendorDetails;
