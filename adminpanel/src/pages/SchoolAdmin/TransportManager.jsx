import React, { useState, useEffect, useRef } from 'react';
import { transportAPI, studentsAPI, classesAPI } from '../../api';
import { Modal } from '../../components/common/Modal';
import { StatusBadge } from '../../components/common/StatusBadge';
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
  Trash2,
  Play,
  Map,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export function TransportManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Lists & Data States
  const [stats, setStats] = useState(null);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [trips, setTrips] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Pagination & Filtering
  const [page, setPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');
  const limit = 20;

  // Form Modals
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

  const [showAssignModal, setShowAssignModal] = useState(null);
  const [assignForm, setAssignForm] = useState({
    vehicle_id: '',
    pickup_point: ''
  });

  // GPS Map modal
  const [showMapModal, setShowMapModal] = useState(null);
  const [mapLocation, setMapLocation] = useState(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const locationIntervalRef = useRef(null);

  // Load Initial Configuration
  useEffect(() => {
    loadClasses();
    loadDrivers();
    loadVehicles();
  }, []);

  // Fetch Tab Specific Details
  useEffect(() => {
    setPage(0);
    loadTabData();
  }, [activeTab, filterClass, filterSection]);

  useEffect(() => {
    loadTabData();
  }, [page]);

  // Load Leaflet dynamically when Active Trips is viewed
  useEffect(() => {
    if (activeTab !== 'active-trips' && !showMapModal) return;

    // Check if Leaflet is already in window
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);

    return () => {
      // Keep Leaflet in DOM to avoid repeatedly injecting on tab change
    };
  }, [activeTab, showMapModal]);

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
      } else if (activeTab === 'vehicles') {
        const res = await transportAPI.listVehicles({ limit, offset: page * limit });
        setVehicles(res.data || []);
        setTotalItems(res.total || 0);
      } else if (activeTab === 'drivers') {
        const res = await transportAPI.listDrivers({ limit, offset: page * limit });
        setDrivers(res.data || []);
        setTotalItems(res.total || 0);
      } else if (activeTab === 'student-transport') {
        // Fetch students & assignments to map together
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
      } else if (activeTab === 'trip-history') {
        const res = await transportAPI.listTrips({ limit, offset: page * limit });
        setTrips(res.data || []);
        setTotalItems(res.total || 0);
        
        // Load pending change requests as well
        const requestsRes = await transportAPI.listRequests({ limit: 10 });
        setRequests(requestsRes.data || []);
      }
    } catch (e) {
      toast.error('Failed to load transport details');
    } finally {
      setLoading(false);
    }
  };

  // ── VEHICLE CRUD ACTIONS ──
  const openAddVehicle = () => {
    setSelectedVehicle(null);
    setVehicleForm({ vehicle_number: '', vehicle_name: '', capacity: '', driver_id: '' });
    setShowVehicleModal(true);
  };

  const openEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setVehicleForm({
      vehicle_number: vehicle.vehicle_number,
      vehicle_name: vehicle.vehicle_name,
      capacity: vehicle.capacity,
      driver_id: vehicle.driver_id || ''
    });
    setShowVehicleModal(true);
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

  const toggleVehicleStatus = async (vehicle) => {
    try {
      await transportAPI.updateVehicle(vehicle.id, { is_active: !vehicle.is_active });
      toast.success(`Vehicle ${!vehicle.is_active ? 'activated' : 'deactivated'}`);
      loadTabData();
    } catch {
      toast.error('Failed to change vehicle status');
    }
  };

  // ── DRIVER CRUD ACTIONS ──
  const openAddDriver = () => {
    setSelectedDriver(null);
    setDriverForm({ username: '', password: '', name: '', phone: '', license_number: '' });
    setShowDriverModal(true);
  };

  const openEditDriver = (driver) => {
    setSelectedDriver(driver);
    setDriverForm({
      username: driver.user?.username || '',
      password: '',
      name: driver.user?.name || '',
      phone: driver.user?.phone || '',
      license_number: driver.license_number
    });
    setShowDriverModal(true);
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedDriver) {
        await transportAPI.updateDriver(selectedDriver.id, {
          name: driverForm.name,
          phone: driverForm.phone,
          license_number: driverForm.license_number
        });
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
      toast.error(err.response?.data?.message || 'Failed to register driver');
    }
  };

  const toggleDriverStatus = async (driver) => {
    try {
      await transportAPI.updateDriver(driver.id, { is_active: !driver.is_active });
      toast.success(`Driver ${!driver.is_active ? 'activated' : 'deactivated'}`);
      loadTabData();
    } catch {
      toast.error('Failed to change status');
    }
  };

  // ── STUDENT ASSIGNMENT ACTIONS ──
  const openAssignModal = (student, currentAssign) => {
    setSelectedStudent(student);
    setAssignForm({
      vehicle_id: currentAssign?.vehicle_id || '',
      pickup_point: currentAssign?.pickup_point || ''
    });
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      if (assignForm.vehicle_id) {
        await transportAPI.assignStudent(
          selectedStudent.id,
          Number(assignForm.vehicle_id),
          assignForm.pickup_point
        );
        toast.success('Transport assigned successfully');
      }
      setShowAssignModal(false);
      loadTabData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign transport');
    }
  };

  const handleUnassign = async (studentId) => {
    if (!window.confirm('Are you sure you want to unassign this student from bus transport?')) return;
    try {
      await transportAPI.unassignStudent(studentId);
      toast.success('Student unassigned from transport');
      loadTabData();
    } catch {
      toast.error('Failed to unassign transport');
    }
  };

  // ── REQUEST APPROVAL ACTIONS ──
  const handleProcessRequest = async (requestId, action) => {
    let reason = null;
    if (action === 'reject') {
      reason = window.prompt('Please enter rejection reason:');
      if (reason === null) return; // cancelled
    }
    try {
      await transportAPI.processRequest(requestId, action, reason);
      toast.success(`Request ${action}ed successfully`);
      loadTabData();
    } catch {
      toast.error('Failed to process request');
    }
  };

  // ── LIVE TRACKING GPS DIALOG ──
  const openLiveTracking = (trip) => {
    setShowMapModal(trip);
    setMapLocation(null);
    setMapLoading(true);

    const fetchLoc = async () => {
      try {
        const res = await transportAPI.listTrips({ limit: 1 }); // Fallback fetch latest coords
        // Actually call our newly configured controller
        const locRes = await fetch(`/api/parent/transport/trips/${trip.trip_id}/location`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const locData = await locRes.json();
        if (locData.success && locData.data) {
          setMapLocation(locData.data);
        }
      } catch (err) {
        console.error('Failed to load coordinates', err);
      } finally {
        setMapLoading(false);
      }
    };

    fetchLoc();
    // Poll location every 5 seconds
    locationIntervalRef.current = setInterval(fetchLoc, 5000);
  };

  const closeLiveTracking = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }
    setShowMapModal(null);
    setMapLocation(null);
  };

  // Update Leaflet marker when coordinates change
  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !mapLocation || !showMapModal) return;

    const L = window.L;
    if (!L) return;

    const lat = Number(mapLocation.latitude);
    const lng = Number(mapLocation.longitude);

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      mapRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      L.marker([lat, lng]).addTo(map).bindPopup(`<b>${showMapModal.vehicle_name}</b><br/>Driver: ${showMapModal.driver_name}`).openPopup();
    } else {
      mapRef.current.setView([lat, lng]);
      // Remove old markers and draw new one
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
      L.marker([lat, lng]).addTo(mapRef.current).bindPopup(`<b>${showMapModal.vehicle_name}</b><br/>Driver: ${showMapModal.driver_name}`).openPopup();
    }
  }, [leafletLoaded, mapLocation, showMapModal]);

  const totalPages = Math.ceil(totalItems / limit);
  const selectedClassDetails = classes.find(c => String(c.id) === String(filterClass));
  const activeSections = selectedClassDetails?.sections || [];

  return (
    <div className="p-6">
      {/* Tab Navigation header */}
      <div className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Truck className="text-indigo-600 w-7 h-7" /> Transport System
          </h1>
          <p className="page-subtitle text-slate-400">Manage vehicles, drivers, student allocations, and track trips</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'vehicles' && (
            <button onClick={openAddVehicle} className="btn-primary flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              <Plus className="w-4 h-4" /> Add Vehicle
            </button>
          )}
          {activeTab === 'drivers' && (
            <button onClick={openAddDriver} className="btn-primary flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">
              <Plus className="w-4 h-4" /> Add Driver
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Navigation },
          { id: 'vehicles', label: 'Vehicles', icon: Truck },
          { id: 'drivers', label: 'Drivers', icon: UserCog },
          { id: 'student-transport', label: 'Student Transport', icon: Users },
          { id: 'active-trips', label: 'Active Trips', icon: MapPin },
          { id: 'trip-history', label: 'Trip Logs', icon: Calendar }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setPage(0); }}
              className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-indigo-600'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">Loading details...</div>
      ) : (
        <>
          {/* 1️⃣ DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Vehicles', val: stats.totalVehicles, icon: Truck, color: 'bg-blue-50 text-blue-600' },
                  { label: 'Active Trips', val: stats.activeTrips, icon: MapPin, color: 'bg-emerald-50 text-emerald-600' },
                  { label: 'Drivers Registered', val: stats.totalDrivers, icon: UserCog, color: 'bg-purple-50 text-purple-600' },
                  { label: 'Students Using Bus', val: stats.studentsUsingBus, icon: Users, color: 'bg-amber-50 text-amber-600' }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} className="card p-5 bg-white border border-slate-100 rounded-xl shadow-sm flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{card.label}</p>
                        <h3 className="text-2xl font-bold text-slate-800 mt-1">{card.val}</h3>
                      </div>
                      <div className={`p-3 rounded-lg ${card.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Currently Running */}
                <div className="card p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Currently Running</h3>
                  {stats.runningBuses?.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">No buses are currently running.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {stats.runningBuses.map((bus, i) => (
                        <div key={i} className="flex justify-between items-center py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full absolute"></span>
                            <div className="ml-2">
                              <h4 className="font-bold text-slate-800 text-sm">{bus.vehicle_name}</h4>
                              <p className="text-xs text-slate-400">Driver: {bus.driver_name} ({bus.vehicle_number})</p>
                            </div>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold uppercase">{bus.trip_type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today's Trips */}
                <div className="card p-5 bg-white border border-slate-100 rounded-xl shadow-sm">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4 border-b pb-2">Today's Trip Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Completed Trips', val: stats.todayTripsSummary?.completed || 0, color: 'bg-emerald-500' },
                      { label: 'Active Trips', val: stats.todayTripsSummary?.running || 0, color: 'bg-indigo-500' },
                      { label: 'Not Started Today', val: stats.todayTripsSummary?.notStarted || 0, color: 'bg-slate-300' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-slate-600">{item.label}</span>
                        </div>
                        <span className="font-bold text-slate-800">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2️⃣ VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
              {vehicles.length === 0 ? (
                <div className="empty-state p-12 text-center">
                  <Truck className="mx-auto w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-bold">No vehicles registered</p>
                  <p className="text-slate-400 text-sm mt-1">Register vehicles to assign them to routes.</p>
                </div>
              ) : (
                <table className="data-table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold">
                      <th className="p-4">Bus / Vehicle Name</th>
                      <th className="p-4">Vehicle Number</th>
                      <th className="p-4">Capacity</th>
                      <th className="p-4">Assigned Driver</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {vehicles.map(v => (
                      <tr key={v.id}>
                        <td className="p-4 font-bold">{v.vehicle_name}</td>
                        <td className="p-4 font-mono text-xs">{v.vehicle_number}</td>
                        <td className="p-4">{v.capacity} Seats</td>
                        <td className="p-4">{v.driver?.user?.name || v.driver?.User?.name || <span className="text-slate-400 italic">Unassigned</span>}</td>
                        <td className="p-4">
                          <StatusBadge status={v.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openEditVehicle(v)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => toggleVehicleStatus(v)} className={`px-2.5 py-1 text-xs rounded font-semibold ${v.is_active ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {v.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 3️⃣ DRIVERS TAB */}
          {activeTab === 'drivers' && (
            <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
              {drivers.length === 0 ? (
                <div className="empty-state p-12 text-center">
                  <UserCog className="mx-auto w-12 h-12 text-slate-300 mb-3" />
                  <p className="text-slate-600 font-bold">No drivers registered</p>
                  <p className="text-slate-400 text-sm mt-1">Register driver accounts for logging in.</p>
                </div>
              ) : (
                <table className="data-table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold">
                      <th className="p-4">Driver Name</th>
                      <th className="p-4">Username</th>
                      <th className="p-4">Phone Number</th>
                      <th className="p-4">License Number</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {drivers.map(d => (
                      <tr key={d.id}>
                        <td className="p-4 font-bold">{d.user?.name}</td>
                        <td className="p-4 font-mono text-xs">{d.user?.username}</td>
                        <td className="p-4">{d.user?.phone || '—'}</td>
                        <td className="p-4 font-mono text-xs">{d.license_number}</td>
                        <td className="p-4">
                          <StatusBadge status={d.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => openEditDriver(d)} className="p-1 text-blue-600 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => toggleDriverStatus(d)} className={`px-2.5 py-1 text-xs rounded font-semibold ${d.is_active ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                            {d.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 4️⃣ STUDENT TRANSPORT TAB */}
          {activeTab === 'student-transport' && (
            <div className="space-y-4">
              {/* Filtering Controls */}
              <div className="flex gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl items-center">
                <div className="flex flex-col">
                  <label className="text-xs text-slate-500 font-bold mb-1">Class Filter</label>
                  <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSection(''); }} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white min-w-[120px]">
                    <option value="">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Class {c.class_name}</option>
                    ))}
                  </select>
                </div>
                {filterClass && (
                  <div className="flex flex-col">
                    <label className="text-xs text-slate-500 font-bold mb-1">Section Filter</label>
                    <select value={filterSection} onChange={e => setFilterSection(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white min-w-[120px]">
                      <option value="">All Sections</option>
                      {activeSections.map(s => (
                        <option key={s.id} value={s.id}>Section {s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Student Allocations */}
              <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
                {students.length === 0 ? (
                  <p className="text-slate-400 text-sm py-12 text-center">No students found matching filters.</p>
                ) : (
                  <table className="data-table w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold">
                        <th className="p-4">Student Name</th>
                        <th className="p-4">Class</th>
                        <th className="p-4">Section</th>
                        <th className="p-4">Assigned Vehicle</th>
                        <th className="p-4">Pickup Point</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {students.map(s => {
                        const activeAssign = assignments.find(a => Number(a.student_id) === Number(s.id));
                        return (
                          <tr key={s.id}>
                            <td className="p-4 font-bold">{s.user?.name}</td>
                            <td className="p-4">Class {s.class?.class_name || '—'}</td>
                            <td className="p-4">Section {s.section?.name || '—'}</td>
                            <td className="p-4">
                              {activeAssign ? (
                                <span className="font-semibold text-indigo-600 flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5" /> {activeAssign.vehicle?.vehicle_name}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic">Not Assigned</span>
                              )}
                            </td>
                            <td className="p-4">{activeAssign?.pickup_point || '—'}</td>
                            <td className="p-4 flex gap-2">
                              <button onClick={() => openAssignModal(s, activeAssign)} className="btn-sm px-2.5 py-1 bg-slate-50 text-indigo-600 border border-slate-200 rounded font-semibold text-xs hover:bg-slate-100 transition">
                                {activeAssign ? 'Edit Transport' : 'Assign'}
                              </button>
                              {activeAssign && (
                                <button onClick={() => handleUnassign(s.id)} className="btn-sm px-2.5 py-1 bg-red-50 text-red-600 border border-red-100 rounded font-semibold text-xs hover:bg-red-100 transition">
                                  Unassign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* 5️⃣ ACTIVE TRIPS TAB */}
          {activeTab === 'active-trips' && (
            <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
              {trips.length === 0 ? (
                <div className="empty-state p-12 text-center text-slate-400">
                  <MapPin className="mx-auto w-12 h-12 mb-3 text-slate-300" />
                  <p className="font-bold text-slate-600">No active trips running</p>
                  <p className="text-sm mt-1">Buses will appear here once drivers start a trip.</p>
                </div>
              ) : (
                <table className="data-table w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold">
                      <th className="p-4">Bus</th>
                      <th className="p-4">Driver</th>
                      <th className="p-4">Trip Type</th>
                      <th className="p-4">Started At</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Map Tracking</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {trips.map((trip, i) => (
                      <tr key={i}>
                        <td className="p-4 font-bold">{trip.vehicle_name} ({trip.vehicle_number})</td>
                        <td className="p-4">{trip.driver_name}</td>
                        <td className="p-4"><span className="text-xs uppercase px-2 py-0.5 rounded-full bg-slate-100 font-bold">{trip.trip_type}</span></td>
                        <td className="p-4">{new Date(trip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-bold">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Moving
                          </span>
                        </td>
                        <td className="p-4">
                          <button onClick={() => openLiveTracking(trip)} className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold">
                            <Map className="w-4 h-4" /> View Live GPS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* 6️⃣ TRIP LOGS TAB & APPROVAL REQUESTS */}
          {activeTab === 'trip-history' && (
            <div className="space-y-8">
              {/* Change Requests Section */}
              {requests.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ClipboardList className="text-amber-500 w-4 h-4" /> Pending Bus Change Requests ({requests.length})
                  </h3>
                  <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
                    <table className="data-table w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-amber-50/50 border-b border-amber-100 text-amber-800 text-xs uppercase font-bold">
                          <th className="p-4">Student</th>
                          <th className="p-4">Current Bus</th>
                          <th className="p-4">Requested Bus</th>
                          <th className="p-4">Pickup Point</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {requests.map(req => (
                          <tr key={req.id}>
                            <td className="p-4 font-bold">{req.student?.user?.name}</td>
                            <td className="p-4 text-slate-400">{req.CurrentVehicle?.vehicle_name || '—'}</td>
                            <td className="p-4 font-semibold text-indigo-600">{req.RequestedVehicle?.vehicle_name}</td>
                            <td className="p-4">{req.pickup_point || '—'}</td>
                            <td className="p-4 flex gap-2">
                              <button onClick={() => handleProcessRequest(req.id, 'approve')} className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100">Approve</button>
                              <button onClick={() => handleProcessRequest(req.id, 'reject')} className="px-2.5 py-1 rounded bg-red-50 text-red-700 font-bold text-xs hover:bg-red-100">Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Trip Logs Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="text-indigo-600 w-4 h-4" /> Trip History Logs
                </h3>
                <div className="card overflow-hidden bg-white border border-slate-100 rounded-xl shadow-sm">
                  {trips.length === 0 ? (
                    <p className="text-slate-400 text-sm py-12 text-center">No trip logs available.</p>
                  ) : (
                    <table className="data-table w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-600 text-xs uppercase font-bold">
                          <th className="p-4">Date</th>
                          <th className="p-4">Bus</th>
                          <th className="p-4">Driver</th>
                          <th className="p-4">Type</th>
                          <th className="p-4">Started</th>
                          <th className="p-4">Ended</th>
                          <th className="p-4">Duration</th>
                          <th className="p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                        {trips.map(t => {
                          const start = new Date(t.started_at);
                          const end = t.ended_at ? new Date(t.ended_at) : null;
                          const durMin = end ? Math.round((end - start) / 60000) : 0;
                          return (
                            <tr key={t.id}>
                              <td className="p-4 font-semibold">{start.toLocaleDateString()}</td>
                              <td className="p-4 font-bold">{t.vehicle?.vehicle_name || 'Bus'}</td>
                              <td className="p-4">{(t.driver?.user ?? t.driver?.User)?.name || '—'}</td>
                              <td className="p-4"><span className="text-xs uppercase px-2 py-0.5 rounded bg-slate-50 font-bold">{t.trip_type}</span></td>
                              <td className="p-4">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td className="p-4">{end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-emerald-500 font-bold">Running</span>}</td>
                              <td className="p-4">{end ? `${durMin} min` : '—'}</td>
                              <td className="p-4">
                                <button className="text-slate-300 cursor-not-allowed flex items-center gap-1 text-xs" disabled>
                                  <Play className="w-3 h-3" /> Replay
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {activeTab !== 'dashboard' && activeTab !== 'active-trips' && totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">Page {page + 1} of {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-3 py-1 bg-white border rounded text-slate-600 disabled:opacity-50">Previous</button>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="px-3 py-1 bg-white border rounded text-slate-600 disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODALS ── */}

      {/* Vehicle Form Modal */}
      <Modal isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)} title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleVehicleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Vehicle Name</label>
            <input type="text" required value={vehicleForm.vehicle_name} onChange={e => setVehicleForm({ ...vehicleForm, vehicle_name: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. Bus 1" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Vehicle Number</label>
            <input type="text" required value={vehicleForm.vehicle_number} onChange={e => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. TN38AB1234" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Seating Capacity</label>
            <input type="number" required value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. 50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Assign Driver</label>
            <select value={vehicleForm.driver_id} onChange={e => setVehicleForm({ ...vehicleForm, driver_id: e.target.value })} className="w-full border p-2 rounded-lg bg-white">
              <option value="">Unassigned</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.user?.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setShowVehicleModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </Modal>

      {/* Driver Form Modal */}
      <Modal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} title={selectedDriver ? 'Edit Driver License' : 'Add Driver'}>
        <form onSubmit={handleDriverSubmit} className="space-y-4">
          {!selectedDriver && (
            <>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Login Username</label>
                <input type="text" required value={driverForm.username} onChange={e => setDriverForm({ ...driverForm, username: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. driver_murugan" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-1">Login Password</label>
                <input type="password" required value={driverForm.password} onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="Minimum 6 characters" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Full Name</label>
            <input type="text" required value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. Murugan" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Phone Number</label>
            <input type="text" required value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. 9876543210" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Driving License Number</label>
            <input type="text" required value={driverForm.license_number} onChange={e => setDriverForm({ ...driverForm, license_number: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. DL-1234567890" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setShowDriverModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Save</button>
          </div>
        </form>
      </Modal>

      {/* Driver Credentials Result Modal */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Driver Account Registered">
        {showCredentials && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm">✅ Account created successfully! Share credentials with the driver.</div>
            <div className="p-4 bg-slate-50 border rounded-lg font-mono text-sm space-y-2">
              <p><b>Driver:</b> {showCredentials.name}</p>
              <p><b>Username:</b> {showCredentials.username}</p>
              <p><b>Password:</b> {showCredentials.password}</p>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowCredentials(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold">Done</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student Transport Assignment Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Transport: ${selectedStudent?.user?.name}`}>
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Select Bus / Vehicle</label>
            <select required value={assignForm.vehicle_id} onChange={e => setAssignForm({ ...assignForm, vehicle_id: e.target.value })} className="w-full border p-2 rounded-lg bg-white">
              <option value="">Select a Bus...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicle_name} ({v.vehicle_number})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Pickup Point</label>
            <input type="text" value={assignForm.pickup_point} onChange={e => setAssignForm({ ...assignForm, pickup_point: e.target.value })} className="w-full border p-2 rounded-lg" placeholder="e.g. Lakshmi Mills" />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button type="button" onClick={() => setShowAssignModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700">Save Assignment</button>
          </div>
        </form>
      </Modal>

      {/* GPS Active Trip Map Tracker Modal */}
      <Modal isOpen={!!showMapModal} onClose={closeLiveTracking} title={`Live GPS Tracking: ${showMapModal?.vehicle_name}`}>
        <div className="space-y-4">
          {mapLoading ? (
            <div className="h-[300px] flex items-center justify-center text-slate-400">Locating vehicle...</div>
          ) : !mapLocation ? (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 border border-dashed rounded-lg p-5">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-2" />
              <p className="font-bold text-slate-700">GPS Signal Offline</p>
              <p className="text-xs text-center mt-1">The driver has started the trip but no coordinate coordinates have been received yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 p-3 rounded-lg border">
                <div>
                  <p className="text-slate-400 font-semibold">SPEED</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{mapLocation.speed ? `${Math.round(mapLocation.speed)} km/h` : '0 km/h'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">HEADING</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{mapLocation.heading ? `${Math.round(mapLocation.heading)}°` : '—'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold">LAST SYNC</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{new Date(mapLocation.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
              <div
                ref={mapContainerRef}
                className="h-[300px] w-full rounded-xl border"
                style={{ background: '#f8fafc', overflow: 'hidden' }}
              ></div>
            </>
          )}
          <div className="flex justify-end pt-2 border-t">
            <button onClick={closeLiveTracking} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-semibold">Close Panel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
export default TransportManager;
