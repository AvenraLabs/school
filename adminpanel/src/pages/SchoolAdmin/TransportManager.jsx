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
  Play,
  Map,
  AlertTriangle,
} from 'lucide-react';

/* ── Custom Inline CSS Styles Object (Replaces Tailwind) ── */
const styles = {
  container: {
    padding: '24px',
    fontFamily: 'inherit',
    color: '#1e293b',
  },
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: 850,
    color: '#0f172a',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    letterSpacing: '-0.03em',
  },
  pageSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginTop: '6px',
    lineHeight: 1.55,
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '2px solid #e2e8f0',
    marginBottom: '24px',
    overflowX: 'auto',
    gap: '12px',
    scrollbarWidth: 'none',
  },
  tabButton: (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    fontWeight: 600,
    fontSize: '14px',
    border: 'none',
    borderBottom: isActive ? '2px solid #4f46e5' : '2px solid transparent',
    color: isActive ? '#4f46e5' : '#64748b',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.15s',
    outline: 'none',
    whiteSpace: 'nowrap',
    marginBottom: '-2px',
  }),
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '28px',
  },
  metricCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  metricIconContainer: (bgColor, textColor) => ({
    padding: '12px',
    borderRadius: '10px',
    backgroundColor: bgColor,
    color: textColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '24px',
    marginBottom: '24px',
  },
  card: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  cardHeader: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '16px',
    borderBottom: '1px solid #f1f5f9',
    paddingBottom: '8px',
  },
  runningRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '40px',
    padding: '0 16px',
    borderRadius: '8px',
    fontSize: '13.5px',
    fontWeight: 600,
    background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
    color: '#fff',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 10px 24px rgba(79, 70, 229, 0.22)',
    transition: 'all 0.2s',
  },
  btnSecondary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '32px',
    padding: '0 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 500,
    background: '#fff',
    color: '#475569',
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
  },
  filterBar: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '16px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formLabel: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#64748b',
    textTransform: 'uppercase',
  },
  input: {
    height: '42px',
    padding: '0 13px',
    border: '1px solid #dbe3ef',
    borderRadius: '12px',
    fontSize: '14px',
    backgroundColor: '#fff',
    outline: 'none',
    minWidth: '160px',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.25rem',
    paddingRight: '2.5rem',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  },
  dialogGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    marginBottom: '16px',
  },
};

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

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
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

    // Add pulse animation style to document head if not already present
    if (!document.getElementById("leaflet-pulse-style")) {
      const style = document.createElement("style");
      style.id = "leaflet-pulse-style";
      style.innerHTML = `
        @keyframes marker-pulse {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          100% {
            transform: scale(2.2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.head.appendChild(script);
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
      if (reason === null) return;
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
        const locRes = await fetch(`/parent/transport/trips/${trip.trip_id}/location`, {
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

  useEffect(() => {
    if (!leafletLoaded || !mapContainerRef.current || !mapLocation || !showMapModal) return;

    const L = window.L;
    if (!L) return;

    const lat = Number(mapLocation.latitude);
    const lng = Number(mapLocation.longitude);

    // Create a beautiful custom pulsing SVG bus icon
    const busIcon = L.divIcon({
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          background: #1976d2;
          border: 2px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        ">
          <div style="
            position: absolute;
            top: -2px;
            left: -2px;
            width: 36px;
            height: 36px;
            border: 2px solid #1976d2;
            border-radius: 50%;
            animation: marker-pulse 1.8s infinite ease-out;
            pointer-events: none;
          "></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="#ffffff">
            <path d="M4 16c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h10v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-3.5c0-3.5-3.58-4.5-8-4.5s-8 1-8 4.5V16zm1.5-4c-.83 0-1.5-.67-1.5-1.5S4.67 9 5.5 9 7 9.67 7 10.5 6.33 12 5.5 12zm13 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 4H6V2h12v2z"/>
          </svg>
        </div>
      `,
      className: 'custom-bus-marker',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      mapRef.current = map;

      // Use premium CartoDB Positron map tiles instead of default OpenStreetMap tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      L.marker([lat, lng], { icon: busIcon }).addTo(map).bindPopup(`<b>${showMapModal.vehicle_name}</b><br/>Driver: ${showMapModal.driver_name}`).openPopup();
    } else {
      mapRef.current.setView([lat, lng]);
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });
      L.marker([lat, lng], { icon: busIcon }).addTo(mapRef.current).bindPopup(`<b>${showMapModal.vehicle_name}</b><br/>Driver: ${showMapModal.driver_name}`).openPopup();
    }
  }, [leafletLoaded, mapLocation, showMapModal]);

  const totalPages = Math.ceil(totalItems / limit);
  const selectedClassDetails = classes.find(c => String(c.id) === String(filterClass));
  const activeSections = selectedClassDetails?.sections || [];

  return (
    <div style={styles.container}>
      {/* Tab Navigation header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>
            <Truck style={{ color: '#4f46e5', width: '28px', height: '28px' }} /> Transport System
          </h1>
          <p style={styles.pageSubtitle}>Manage vehicles, drivers, student allocations, and track trips</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {activeTab === 'vehicles' && (
            <button onClick={openAddVehicle} style={styles.btnPrimary}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Vehicle
            </button>
          )}
          {activeTab === 'drivers' && (
            <button onClick={openAddDriver} style={styles.btnPrimary}>
              <Plus style={{ width: '16px', height: '16px' }} /> Add Driver
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabsContainer}>
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
              style={styles.tabButton(isActive)}
            >
              <Icon style={{ width: '16px', height: '16px' }} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}
      {loading ? (
        <div style={{ ...styles.card, padding: '48px', textAlign: 'center', color: '#64748b' }}>
          Loading details...
        </div>
      ) : (
        <>
          {/* 1️⃣ DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Metrics Grid */}
              <div style={styles.metricsGrid}>
                {[
                  { label: 'Total Vehicles', val: stats.totalVehicles, icon: Truck, bg: '#eff6ff', text: '#2563eb' },
                  { label: 'Active Trips', val: stats.activeTrips, icon: MapPin, bg: '#ecfdf5', text: '#059669' },
                  { label: 'Drivers Registered', val: stats.totalDrivers, icon: UserCog, bg: '#faf5ff', text: '#7c3aed' },
                  { label: 'Students Using Bus', val: stats.studentsUsingBus, icon: Users, bg: '#fffbeb', text: '#d97706' }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} style={styles.metricCard}>
                      <div>
                        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                          {card.label}
                        </p>
                        <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#1e293b', margin: '4px 0 0' }}>
                          {card.val}
                        </h3>
                      </div>
                      <div style={styles.metricIconContainer(card.bg, card.text)}>
                        <Icon style={{ width: '22px', height: '22px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={styles.contentGrid}>
                {/* Currently Running */}
                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>Currently Running</h3>
                  {stats.runningBuses?.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '13px', textAlign: 'center', margin: '20px 0' }}>
                      No buses are currently running.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {stats.runningBuses.map((bus, i) => (
                        <div key={i} style={styles.runningRow}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              width: '10px',
                              height: '10px',
                              backgroundColor: '#10b981',
                              borderRadius: '50%',
                              animation: 'blink 1.5s infinite',
                            }}></span>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
                                {bus.vehicle_name}
                              </h4>
                              <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                                Driver: {bus.driver_name} ({bus.vehicle_number})
                              </p>
                            </div>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#ecfdf5',
                            color: '#065f46',
                            textTransform: 'uppercase'
                          }}>
                            {bus.trip_type}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Today's Trips */}
                <div style={styles.card}>
                  <h3 style={styles.cardHeader}>Today's Trip Summary</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      { label: 'Completed Trips', val: stats.todayTripsSummary?.completed || 0, color: '#10b981' },
                      { label: 'Active Trips', val: stats.todayTripsSummary?.running || 0, color: '#4f46e5' },
                      { label: 'Not Started Today', val: stats.todayTripsSummary?.notStarted || 0, color: '#94a3b8' }
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }}></div>
                          <span style={{ fontSize: '13.5px', color: '#475569' }}>{item.label}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2️⃣ VEHICLES TAB */}
          {activeTab === 'vehicles' && (
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              {vehicles.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <Truck style={{ margin: '0 auto 12px', width: '48px', height: '48px', color: '#cbd5e1' }} />
                  <p style={{ fontWeight: 700, color: '#64748b', margin: 0 }}>No vehicles registered</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Register vehicles to assign them to routes.</p>
                </div>
              ) : (
                <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      <th style={{ padding: '14px 16px' }}>Bus / Vehicle Name</th>
                      <th style={{ padding: '14px 16px' }}>Vehicle Number</th>
                      <th style={{ padding: '14px 16px' }}>Capacity</th>
                      <th style={{ padding: '14px 16px' }}>Assigned Driver</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                    {vehicles.map(v => (
                      <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{v.vehicle_name}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px' }}>{v.vehicle_number}</td>
                        <td style={{ padding: '14px 16px' }}>{v.capacity} Seats</td>
                        <td style={{ padding: '14px 16px' }}>{v.driver?.user?.name || v.driver?.User?.name || <span style={{ color: '#94a3b8', fontFamily: 'inherit', fontStyle: 'italic' }}>Unassigned</span>}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <StatusBadge status={v.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button onClick={() => openEditVehicle(v)} style={styles.btnSecondary}><Edit2 style={{ width: '13px', height: '13px' }} /></button>
                          <button onClick={() => toggleVehicleStatus(v)} style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: v.is_active ? '#fef2f2' : '#ecfdf5',
                            color: v.is_active ? '#991b1b' : '#065f46'
                          }}>
                            {v.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}

          {/* 3️⃣ DRIVERS TAB */}
          {activeTab === 'drivers' && (
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              {drivers.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <UserCog style={{ margin: '0 auto 12px', width: '48px', height: '48px', color: '#cbd5e1' }} />
                  <p style={{ fontWeight: 700, color: '#64748b', margin: 0 }}>No drivers registered</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Register driver accounts for logging in.</p>
                </div>
              ) : (
                <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      <th style={{ padding: '14px 16px' }}>Driver Name</th>
                      <th style={{ padding: '14px 16px' }}>Username</th>
                      <th style={{ padding: '14px 16px' }}>Phone Number</th>
                      <th style={{ padding: '14px 16px' }}>License Number</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                    {drivers.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{d.user?.name}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px' }}>{d.user?.username}</td>
                        <td style={{ padding: '14px 16px' }}>{d.user?.phone || '—'}</td>
                        <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '12px' }}>{d.license_number}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <StatusBadge status={d.is_active ? 'active' : 'inactive'} />
                        </td>
                        <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button onClick={() => openEditDriver(d)} style={styles.btnSecondary}><Edit2 style={{ width: '13px', height: '13px' }} /></button>
                          <button onClick={() => toggleDriverStatus(d)} style={{
                            padding: '4px 10px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            backgroundColor: d.is_active ? '#fef2f2' : '#ecfdf5',
                            color: d.is_active ? '#991b1b' : '#065f46'
                          }}>
                            {d.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}

          {/* 4️⃣ STUDENT TRANSPORT TAB */}
          {activeTab === 'student-transport' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Filtering Controls */}
              <div style={styles.filterBar}>
                <div style={styles.formGroup}>
                  <span style={styles.formLabel}>Class Filter</span>
                  <select value={filterClass} onChange={e => { setFilterClass(e.target.value); setFilterSection(''); }} style={styles.input}>
                    <option value="">All Classes</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>Class {c.class_name}</option>
                    ))}
                  </select>
                </div>
                {filterClass && (
                  <div style={styles.formGroup}>
                    <span style={styles.formLabel}>Section Filter</span>
                    <select value={filterSection} onChange={e => setFilterSection(e.target.value)} style={styles.input}>
                      <option value="">All Sections</option>
                      {activeSections.map(s => (
                        <option key={s.id} value={s.id}>Section {s.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Student Allocations */}
              <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                {students.length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '13.5px', padding: '48px', textAlign: 'center', margin: 0 }}>
                    No students found matching filters.
                  </p>
                ) : (
                  <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                        <th style={{ padding: '14px 16px' }}>Student Name</th>
                        <th style={{ padding: '14px 16px' }}>Class</th>
                        <th style={{ padding: '14px 16px' }}>Section</th>
                        <th style={{ padding: '14px 16px' }}>Assigned Vehicle</th>
                        <th style={{ padding: '14px 16px' }}>Pickup Point</th>
                        <th style={{ padding: '14px 16px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                      {students.map(s => {
                        const activeAssign = assignments.find(a => Number(a.student_id) === Number(s.id));
                        return (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>{s.user?.name}</td>
                            <td style={{ padding: '14px 16px' }}>Class {s.class?.class_name || '—'}</td>
                            <td style={{ padding: '14px 16px' }}>Section {s.section?.name || '—'}</td>
                            <td style={{ padding: '14px 16px' }}>
                              {activeAssign ? (
                                <span style={{ fontWeight: 700, color: '#4f46e5', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Truck style={{ width: '14px', height: '14px' }} /> {activeAssign.vehicle?.vehicle_name}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not Assigned</span>
                              )}
                            </td>
                            <td style={{ padding: '14px 16px' }}>{activeAssign?.pickup_point || '—'}</td>
                            <td style={{ padding: '14px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <button onClick={() => openAssignModal(s, activeAssign)} style={styles.btnSecondary}>
                                {activeAssign ? 'Edit' : 'Assign'}
                              </button>
                              {activeAssign && (
                                <button onClick={() => handleUnassign(s.id)} style={{
                                  padding: '4px 10px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  border: 'none',
                                  cursor: 'pointer',
                                  backgroundColor: '#fef2f2',
                                  color: '#991b1b'
                                }}>
                                  Unassign
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5️⃣ ACTIVE TRIPS TAB */}
          {activeTab === 'active-trips' && (
            <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
              {trips.length === 0 ? (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <MapPin style={{ margin: '0 auto 12px', width: '48px', height: '48px', color: '#cbd5e1' }} />
                  <p style={{ fontWeight: 700, color: '#64748b', margin: 0 }}>No active trips running</p>
                  <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>Buses will appear here once drivers start a trip.</p>
                </div>
              ) : (
                <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                      <th style={{ padding: '14px 16px' }}>Bus</th>
                      <th style={{ padding: '14px 16px' }}>Driver</th>
                      <th style={{ padding: '14px 16px' }}>Trip Type</th>
                      <th style={{ padding: '14px 16px' }}>Started At</th>
                      <th style={{ padding: '14px 16px' }}>Status</th>
                      <th style={{ padding: '14px 16px' }}>Map Tracking</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                    {trips.map((trip, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '14px 16px', fontWeight: 700 }}>{trip.vehicle_name} ({trip.vehicle_number})</td>
                        <td style={{ padding: '14px 16px' }}>{trip.driver_name}</td>
                        <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#f1f5f9', fontWeight: 700 }}>{trip.trip_type}</span></td>
                        <td style={{ padding: '14px 16px' }}>{new Date(trip.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '50%', animation: 'blink 1.5s infinite' }}></span> Moving
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => openLiveTracking(trip)} style={{ background: 'transparent', border: 'none', color: '#4f46e5', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Map style={{ width: '14px', height: '14px' }} /> View Live GPS
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}

          {/* 6️⃣ TRIP LOGS TAB & APPROVAL REQUESTS */}
          {activeTab === 'trip-history' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Change Requests Section */}
              {requests.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClipboardList style={{ color: '#d97706', width: '18px', height: '18px' }} /> Pending Bus Change Requests ({requests.length})
                  </h3>
                  <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                    <div className="table-responsive">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: '11px', color: '#b45309', textTransform: 'uppercase', fontWeight: 700 }}>
                          <th style={{ padding: '14px 16px' }}>Student</th>
                          <th style={{ padding: '14px 16px' }}>Current Bus</th>
                          <th style={{ padding: '14px 16px' }}>Requested Bus</th>
                          <th style={{ padding: '14px 16px' }}>Pickup Point</th>
                          <th style={{ padding: '14px 16px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                        {requests.map(req => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700 }}>{req.student?.user?.name}</td>
                            <td style={{ padding: '14px 16px', color: '#94a3b8' }}>{req.CurrentVehicle?.vehicle_name || '—'}</td>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#4f46e5' }}>{req.RequestedVehicle?.vehicle_name}</td>
                            <td style={{ padding: '14px 16px' }}>{req.pickup_point || '—'}</td>
                            <td style={{ padding: '14px 16px', display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleProcessRequest(req.id, 'approve')} style={{ padding: '4px 12px', fontSize: '11.5px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: '#ecfdf5', color: '#065f46' }}>Approve</button>
                              <button onClick={() => handleProcessRequest(req.id, 'reject')} style={{ padding: '4px 12px', fontSize: '11.5px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 700, backgroundColor: '#fef2f2', color: '#991b1b' }}>Reject</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Trip Logs Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar style={{ color: '#4f46e5', width: '18px', height: '18px' }} /> Trip History Logs
                </h3>
                <div style={{ ...styles.card, padding: 0, overflow: 'hidden' }}>
                  {trips.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontSize: '13.5px', padding: '48px', textAlign: 'center', margin: 0 }}>
                      No trip logs available.
                    </p>
                  ) : (
                    <div className="table-responsive">
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>
                          <th style={{ padding: '14px 16px' }}>Date</th>
                          <th style={{ padding: '14px 16px' }}>Bus</th>
                          <th style={{ padding: '14px 16px' }}>Driver</th>
                          <th style={{ padding: '14px 16px' }}>Type</th>
                          <th style={{ padding: '14px 16px' }}>Started</th>
                          <th style={{ padding: '14px 16px' }}>Ended</th>
                          <th style={{ padding: '14px 16px' }}>Duration</th>
                          <th style={{ padding: '14px 16px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: '13.5px', color: '#334155' }}>
                        {trips.map(t => {
                          const start = new Date(t.started_at);
                          const end = t.ended_at ? new Date(t.ended_at) : null;
                          const durMin = end ? Math.round((end - start) / 60000) : 0;
                          return (
                            <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '14px 16px', fontWeight: 600 }}>{start.toLocaleDateString()}</td>
                              <td style={{ padding: '14px 16px', fontWeight: 700 }}>{t.vehicle?.vehicle_name || 'Bus'}</td>
                              <td style={{ padding: '14px 16px' }}>{(t.driver?.user ?? t.driver?.User)?.name || '—'}</td>
                              <td style={{ padding: '14px 16px' }}><span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '12px', backgroundColor: '#f1f5f9', fontWeight: 700 }}>{t.trip_type}</span></td>
                              <td style={{ padding: '14px 16px' }}>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                              <td style={{ padding: '14px 16px' }}>{end ? end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span style={{ color: '#10b981', fontWeight: 700 }}>Running</span>}</td>
                              <td style={{ padding: '14px 16px' }}>{end ? `${durMin} min` : '—'}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <button style={{ background: 'transparent', border: 'none', color: '#cbd5e1', fontSize: '12px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '4px' }} disabled>
                                  <Play style={{ width: '12px', height: '12px' }} /> Replay
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pagination */}
          {activeTab !== 'dashboard' && activeTab !== 'active-trips' && totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
              <span style={{ fontSize: '13px', color: '#64748b' }}>Page {page + 1} of {totalPages}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} style={{ ...styles.btnSecondary, opacity: page === 0 ? 0.5 : 1 }}>Previous</button>
                <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} style={{ ...styles.btnSecondary, opacity: page >= totalPages - 1 ? 0.5 : 1 }}>Next</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODALS ── */}

      {/* Vehicle Form Modal */}
      <Modal isOpen={showVehicleModal} onClose={() => setShowVehicleModal(false)} title={selectedVehicle ? 'Edit Vehicle' : 'Add Vehicle'}>
        <form onSubmit={handleVehicleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Vehicle Name</label>
            <input type="text" required value={vehicleForm.vehicle_name} onChange={e => setVehicleForm({ ...vehicleForm, vehicle_name: e.target.value })} style={styles.input} placeholder="e.g. Bus 1" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Vehicle Number</label>
            <input type="text" required value={vehicleForm.vehicle_number} onChange={e => setVehicleForm({ ...vehicleForm, vehicle_number: e.target.value })} style={styles.input} placeholder="e.g. TN38AB1234" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Seating Capacity</label>
            <input type="number" required value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} style={styles.input} placeholder="e.g. 50" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Assign Driver</label>
            <select value={vehicleForm.driver_id} onChange={e => setVehicleForm({ ...vehicleForm, driver_id: e.target.value })} style={{ ...styles.input, height: '38px' }}>
              <option value="">Unassigned</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.user?.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button type="button" onClick={() => setShowVehicleModal(false)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" style={styles.btnPrimary}>Save</button>
          </div>
        </form>
      </Modal>

      {/* Driver Form Modal */}
      <Modal isOpen={showDriverModal} onClose={() => setShowDriverModal(false)} title={selectedDriver ? 'Edit Driver' : 'Add Driver'}>
        <form onSubmit={handleDriverSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
          {selectedDriver ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Reset Password (leave blank to keep current)</label>
              <input type="password" value={driverForm.password} onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} style={styles.input} placeholder="Enter new password (optional)" />
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Login Username</label>
                <input type="text" required value={driverForm.username} onChange={e => setDriverForm({ ...driverForm, username: e.target.value })} style={styles.input} placeholder="e.g. driver_murugan" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Login Password</label>
                <input type="password" required value={driverForm.password} onChange={e => setDriverForm({ ...driverForm, password: e.target.value })} style={styles.input} placeholder="Minimum 6 characters" />
              </div>
            </>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Full Name</label>
            <input type="text" required value={driverForm.name} onChange={e => setDriverForm({ ...driverForm, name: e.target.value })} style={styles.input} placeholder="e.g. Murugan" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Phone Number</label>
            <input type="text" required maxLength={10} value={driverForm.phone} onChange={e => setDriverForm({ ...driverForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} style={styles.input} placeholder="10 Digit Mobile Number" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Driving License Number</label>
            <input type="text" required value={driverForm.license_number} onChange={e => setDriverForm({ ...driverForm, license_number: e.target.value })} style={styles.input} placeholder="e.g. DL-1234567890" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button type="button" onClick={() => setShowDriverModal(false)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" style={styles.btnPrimary}>Save</button>
          </div>
        </form>
      </Modal>

      {/* Driver Credentials Result Modal */}
      <Modal isOpen={!!showCredentials} onClose={() => setShowCredentials(null)} title="Driver Account Registered">
        {showCredentials && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
            <div style={{ padding: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', color: '#065f46', borderRadius: '8px', fontSize: '13px' }}>
              ✅ Account created successfully! Share credentials with the driver.
            </div>
            <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0 }}><b>Driver:</b> {showCredentials.name}</p>
              <p style={{ margin: 0 }}><b>Username:</b> {showCredentials.username}</p>
              <p style={{ margin: 0 }}><b>Password:</b> {showCredentials.password}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowCredentials(null)} style={styles.btnPrimary}>Done</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Student Transport Assignment Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title={`Assign Transport: ${selectedStudent?.user?.name}`}>
        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '320px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Select Bus / Vehicle</label>
            <select required value={assignForm.vehicle_id} onChange={e => setAssignForm({ ...assignForm, vehicle_id: e.target.value })} style={{ ...styles.input, height: '38px' }}>
              <option value="">Select a Bus...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.vehicle_name} ({v.vehicle_number})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>Pickup Point</label>
            <input type="text" value={assignForm.pickup_point} onChange={e => setAssignForm({ ...assignForm, pickup_point: e.target.value })} style={styles.input} placeholder="e.g. Lakshmi Mills" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button type="button" onClick={() => setShowAssignModal(false)} style={styles.btnSecondary}>Cancel</button>
            <button type="submit" style={styles.btnPrimary}>Save Assignment</button>
          </div>
        </form>
      </Modal>

      {/* GPS Active Trip Map Tracker Modal */}
      <Modal isOpen={!!showMapModal} onClose={closeLiveTracking} title={`Live GPS Tracking: ${showMapModal?.vehicle_name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '340px' }}>
          {mapLoading ? (
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Locating vehicle...</div>
          ) : !mapLocation ? (
            <div style={{ height: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <AlertTriangle style={{ width: '48px', height: '48px', color: '#f59e0b', marginBottom: '8px' }} />
              <p style={{ fontWeight: 700, margin: 0, color: '#475569' }}>GPS Signal Offline</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px', maxWidth: '240px' }}>The driver has started the trip but no coordinates have been received yet.</p>
            </div>
          ) : (
            <>
              <div style={styles.dialogGrid}>
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 700, fontSize: '10px' }}>SPEED</p>
                  <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#334155', fontSize: '13.5px' }}>{mapLocation.speed ? `${Math.round(mapLocation.speed)} km/h` : '0 km/h'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 700, fontSize: '10px' }}>HEADING</p>
                  <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#334155', fontSize: '13.5px' }}>{mapLocation.heading ? `${Math.round(mapLocation.heading)}°` : '—'}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 700, fontSize: '10px' }}>LAST SYNC</p>
                  <p style={{ margin: '2px 0 0', fontWeight: 800, color: '#334155', fontSize: '13.5px' }}>{new Date(mapLocation.created_at).toLocaleTimeString()}</p>
                </div>
              </div>
              <div
                ref={mapContainerRef}
                style={{ height: '300px', width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc', overflow: 'hidden' }}
              ></div>
            </>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <button onClick={closeLiveTracking} style={styles.btnPrimary}>Close Panel</button>
          </div>
        </div>
      </Modal>

      {/* Scoped CSS animations */}
      <style>{`
        @keyframes blink {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

export default TransportManager;

