import IotDataTable from "../../component/Device/IoTDataTable";
import GroupList from "../../component/Device/GroupList";
import "./Device.css";

export default function Device() {


  return (
    <>
          <div style={{display:'flex'}}>
                <GroupList/>
                <IotDataTable/>
          </div>
               

      

    </>
  );
}
