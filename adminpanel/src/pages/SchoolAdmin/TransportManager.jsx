import React, { useState, useEffect, useRef } from 'react';
import { formatDate } from '../../utils/date';
import { transportAPI, studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Select, Input } from '../../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { StatsCard } from '../../components/common/StatsCard';
import { useToast } from '../../context/ToastContext';
import {
  Truck,
  Users,
  UserCog,
  MapPin,
  ClipboardList,
  Navigation,
  Calendar,
  Phone,
  Plus,
  Edit2,
  Play,
  Map,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export function TransportManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const limit = 20;

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_number: '',
    vehicle_name: '',
    capacity: '',
    driver_id: ''
  });

  const [showDriverModal, setShowDriverModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);
  const [driverForm, setDriverForm] = useState({
    username: '',
    password: '',
    name: '',
    phone: '',
    license_number: ''
  });

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assignForm, setAssignForm] = useState({
    vehicle_id: '',
    stop_name: '',
    pickup_time: ''
  });

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [tripLogs, setTripLogs] = useState([]);
  const [showTripModal, setShowTripModal] = useState(false);
  const [googleMapsEnabled, setGoogleMapsEnabled] = useState(false);

  useEffect(() => {
    loadClasses();
    loadDrivers();
    loadVehicles();
  }, []);

  useEffect(() => {
    loadTabData();
  }, [activeTab, page, filterClass, filterSection]);

  const loadClasses = async () => {
    try {
      const res = await classesAPI.list();
      setClasses(res.items || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadDrivers = async () => {
    try {
      const res = await transportAPI.listDrivers({ limit: 100 });
      setDrivers(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await transportAPI.listVehicles({ limit: 100 });
      setVehicles(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await transportAPI.getDashboardStats();
        setStats(res.data);
        setGoogleMapsEnabled(res.data?.google_maps_enabled || false);
      } else if (activeTab === 'vehicles') {
        const res = await transportAPI.listVehicles({ limit, offset: page * limit });
        setVehicles(res.data || []);
        setTotalItems(res.total || 0);
      } else if (activeTab === 'drivers') {
        const res = await transportAPI.listDrivers({ limit, offset: page * limit });
        setDrivers(res.data || []);
        setTotalItems(res.total || 0);
      } else if (activeTab === 'student-transport') {
        const studentsRes = await studentsAPI.list(limit, page * limit, filterClass || undefined, filterSection || undefined);
        const assignRes = await transportAPI.listAssignments({ limit: 1000 });
        setStudents(studentsRes.items || []);
        setTotalItems(studentsRes.total || 0);
        setAssignments(assignRes.data || []);
      } else if (activeTab === 'active-trips') {
        const res = await transportAPI.getDashboardStats();
        setStats(res.data);
        setTrips(res.data?.runningBuses || []);
        setTotalItems(res.data?.runningBuses?.length || 0);
        setGoogleMapsEnabled(res.data?.google_maps_enabled || false);
      } else if (activeTab === 'trip-history') {
        const res = await transportAPI.listTrips({ limit, offset: page * limit });
        setTrips(res.data || []);
        setTotalItems(res.total || 0);
        const requestsRes = await transportAPI.listRequests({ limit: 10 });
        setRequests(requestsRes.data || []);
      }
    } catch (e) {
      toast.error('Failed to load transport details');
    } finally {
      setLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...vehicleForm,
        capacity: Number(vehicleForm.capacity),
        driver_id: vehicleForm.driver_id ? Number(vehicleForm.driver_id) : null
      };

      if (selectedVehicle) {
        await transportAPI.updateVehicle(selectedVehicle.id, payload);
        toast.success('Vehicle updated');
      } else {
        await transportAPI.createVehicle(payload);
        toast.success('Vehicle registered');
      }
      setShowVehicleModal(false);
      loadVehicles();
      loadTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save vehicle');
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDriver) {
        const payload = {
          name: driverForm.name,
          phone: driverForm.phone,
          license_number: driverForm.license_number
        };
        if (driverForm.password) {
          payload.password = driverForm.password;
        }
        await transportAPI.updateDriver(selectedDriver.id, payload);
        toast.success('Driver profile updated');
      } else {
        const res = await transportAPI.createDriver(driverForm);
        toast.success('Driver registered successfully');
        setShowCredentials({
          username: res.data?.user?.username,
          password: driverForm.password,
          name: driverForm.name
        });
      }
      setShowDriverModal(false);
      loadDrivers();
      loadTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save driver');
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      await transportAPI.assignStudent({
        student_id: selectedStudent.id,
        vehicle_id: Number(assignForm.vehicle_id),
        stop_name: assignForm.stop_name,
        pickup_time: assignForm.pickup_time
      });
      toast.success('Student bus transport assigned!');
      setShowAssignModal(false);
      loadTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign transport');
    }
  };

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <div className="space-y-6">
      {/* Compact Action Bar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#14213D]">Transport Logistics & Fleet Desk</span>
            <span className="text-[#8C97AB]">|</span>
            <span className="text-[#52607D]">Active Fleet: {vehicles.length} Vehicles</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={UserCog}
              onClick={() => {
                setSelectedDriver(null);
                setDriverForm({ username: '', password: '', name: '', phone: '', license_number: '' });
                setShowDriverModal(true);
              }}
            >
              Add Driver
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={Truck}
              onClick={() => {
                setSelectedVehicle(null);
                setVehicleForm({ vehicle_number: '', vehicle_name: '', capacity: '', driver_id: '' });
                setShowVehicleModal(true);
              }}
            >
              Add Vehicle
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs Row */}
      <div className="flex gap-1 border-b border-[#E4E1D8] overflow-x-auto pb-px">
        {[
          { id: 'dashboard', label: 'Fleet Overview', icon: Truck },
          { id: 'vehicles', label: 'Buses Roster', icon: Truck },
          { id: 'drivers', label: 'Drivers Roster', icon: UserCog },
          { id: 'student-transport', label: 'Student Allocations', icon: Users },
          { id: 'active-trips', label: 'Active GPS Trips', icon: Navigation },
          { id: 'trip-history', label: 'Trip Logs', icon: ClipboardList },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-t-[8px] transition-all cursor-pointer border-t border-x outline-none ${
                isActive
                  ? 'bg-white border-[#E4E1D8] border-t-[3px] border-t-[#2F6F5E] text-[#2F6F5E] -mb-px shadow-2xs'
                  : 'bg-transparent border-transparent text-[#52607D] hover:text-[#14213D] hover:bg-[#FAFAF8]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2F6F5E]' : 'text-[#8C97AB]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Overview Metrics Cards */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatsCard title="Total Registered Buses" value={stats?.totalVehicles || 0} icon={Truck} active={true} />
          <StatsCard title="Active Drivers Roster" value={stats?.totalDrivers || 0} icon={UserCog} />
          <StatsCard title="Students Assigned Bus" value={stats?.assignedStudents || 0} icon={Users} />
          <StatsCard title="Buses Live En-Route" value={stats?.activeTrips || 0} icon={Navigation} />
        </div>
      )}

      {/* Main Tab Panels */}
      <Card>
        {loading ? (
          <div className="p-8 text-center text-xs text-[#8C97AB]">Loading transport data...</div>
        ) : activeTab === 'vehicles' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Bus Number</th>
                  <th className="px-4 py-3">Vehicle Model / Name</th>
                  <th className="px-4 py-3">Seating Capacity</th>
                  <th className="px-4 py-3">Assigned Driver</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <EmptyState icon={Truck} title="No buses registered" description="Add your first school bus to start assigning routes." />
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5 font-mono font-bold text-[#14213D]">{v.vehicle_number}</td>
                      <td className="px-4 py-2.5 font-medium">{v.vehicle_name}</td>
                      <td className="px-4 py-2.5 font-mono">{v.capacity} seats</td>
                      <td className="px-4 py-2.5 font-medium">{v.driver?.user?.name || 'Unassigned'}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={v.is_active ? 'active' : 'inactive'} size="sm" /></td>
                      <td className="px-4 py-2.5 text-right">
                        <Button variant="ghost" size="sm" icon={Edit2} onClick={() => { setSelectedVehicle(v); setVehicleForm({ vehicle_number: v.vehicle_number, vehicle_name: v.vehicle_name, capacity: v.capacity, driver_id: v.driver_id || '' }); setShowVehicleModal(true); }}>Edit</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'drivers' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#FAFAF8] border-b border-[#E4E1D8] text-[#52607D] font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Driver Name</th>
                  <th className="px-4 py-3">Phone Contact</th>
                  <th className="px-4 py-3">License Number</th>
                  <th className="px-4 py-3">Assigned Vehicle</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDEAE1] text-[#14213D]">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <EmptyState icon={UserCog} title="No drivers registered" description="Register drivers to operate school buses." />
                    </td>
                  </tr>
                ) : (
                  drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-[#FAFAF8]">
                      <td className="px-4 py-2.5 font-medium">{d.user?.name || '—'}</td>
                      <td className="px-4 py-2.5 font-mono text-[#2F6F5E]">{d.user?.phone || '—'}</td>
                      <td className="px-4 py-2.5 font-mono">{d.license_number || '—'}</td>
                      <td className="px-4 py-2.5 font-semibold">{d.vehicles?.[0]?.vehicle_number || 'Unassigned'}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={d.is_active ? 'active' : 'inactive'} size="sm" /></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-[#8C97AB]">
            Select a transport sub-tab to inspect details.
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-4 py-3 bg-[#FAFAF8] border-t border-[#E4E1D8] flex items-center justify-between text-xs text-[#52607D]">
            <span>Page <strong className="text-[#14213D] font-mono">{page + 1}</strong> of <strong className="text-[#14213D] font-mono">{totalPages}</strong></span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={ChevronLeft} onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>Previous</Button>
              <Button variant="outline" size="sm" iconRight={ChevronRight} onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1}>Next</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal: Vehicle Registration */}
      <Modal isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)} title="Register School Bus">
        <form onSubmit={handleVehicleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Vehicle Plate Number *</label>
            <Input required placeholder="e.g. MH-12-AB-1234" value={vehicleForm.vehicle_number} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} />
          </div>
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Vehicle Model / Name *</label>
            <Input required placeholder="e.g. Yellow Bus 04" value={vehicleForm.vehicle_name} onChange={(e) => setVehicleForm({ ...vehicleForm, vehicle_name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Seating Capacity *</label>
              <Input type="number" required placeholder="e.g. 40" value={vehicleForm.capacity} onChange={(e) => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Driver</label>
              <Select value={vehicleForm.driver_id} onChange={(e) => setVehicleForm({ ...vehicleForm, driver_id: e.target.value })}>
                <option value="">Select Driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>{d.user?.name || `Driver #${d.id}`}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowVehicleModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Save Bus</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Driver Registration */}
      <Modal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} title="Register Transport Driver">
        <form onSubmit={handleDriverSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-[#14213D] mb-1">Driver Full Name *</label>
            <Input required placeholder="Driver full name" value={driverForm.name} onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Username *</label>
              <Input required placeholder="Username" value={driverForm.username} onChange={(e) => setDriverForm({ ...driverForm, username: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Password *</label>
              <Input required type="password" placeholder="Password" value={driverForm.password} onChange={(e) => setDriverForm({ ...driverForm, password: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">Phone Number *</label>
              <Input required placeholder="Phone number" value={driverForm.phone} onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })} />
            </div>
            <div>
              <label className="block font-semibold text-[#14213D] mb-1">License Number *</label>
              <Input required placeholder="DL number" value={driverForm.license_number} onChange={(e) => setDriverForm({ ...driverForm, license_number: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-[#EDEAE1]">
            <Button variant="outline" type="button" onClick={() => setShowDriverModal(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Register Driver</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
