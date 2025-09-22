import Card from '../component/Card';
import Table from '../component/Table';
import "./DashboardAdmin.css";
export default function DashboardAdmin() {

    return (
        <> 
            <div className='device_card'>
                <Card
                title="🔵 All Device"
                value={50}
                />
                <Card
                title="🟢 Online"
                value={50}
                />
                <Card
                title="🔴 Offline"
                value={50}
                />
            </div>
         <Table/>
        </>
    );
}