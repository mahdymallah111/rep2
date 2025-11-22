import React, { useState, useEffect, useMemo } from "react";
import { DataManager } from '../utils/dataPersistence';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editRoom, setEditRoom] = useState(null);
  const [activeTab, setActiveTab] = useState('rooms');

  const [buildings] = useState(["Building E", "Building C", "Building D"]);
  const roomNameOptions = ["Auditorium", "C3", "D4"];
  const seatColorOptions = ['Red', 'Green', 'Blue', 'Yellow', 'Orange', 'Purple'];

  const [newRoom, setNewRoom] = useState({
    id: null,
    name: "",
    building: "",
    capacity: "",
    status: "available",
    seatColors: ['Red', 'Green', 'Blue'],
    usedSeatColors: []
  });

  // Load saved rooms using DataManager - FIXED: Ensure we only load once
  useEffect(() => {
    const loadedRooms = DataManager.getRooms();
    console.log('Loaded rooms:', loadedRooms); // Debug log
    setRooms(loadedRooms);
  }, []);

  // Save to DataManager whenever rooms change - FIXED: Proper persistence
  useEffect(() => {
    if (rooms.length > 0) {
      console.log('Saving rooms:', rooms); // Debug log
      DataManager.saveRooms(rooms);
    }
  }, [rooms]);

  // Stats Generate Dynamically
  const stats = useMemo(() => {
    const total = rooms.length;
    const available = rooms.filter((r) => r.status === "available").length;
    const totalCapacity = rooms.reduce((total, room) => total + Number(room.capacity), 0);
    const totalSeatColors = rooms.reduce((total, room) => total + room.seatColors.length, 0);

    return {
      total,
      available,
      totalCapacity,
      totalSeatColors,
      averageCapacity: total > 0 ? Math.round(totalCapacity / total) : 0,
    };
  }, [rooms]);

  // Reset form
  const resetForm = () => {
    setNewRoom({
      id: null,
      name: "",
      building: "",
      capacity: "",
      status: "available",
      seatColors: ['Red', 'Green', 'Blue'],
      usedSeatColors: []
    });
    setEditRoom(null);
  };

  // Handle seat color selection
  const handleSeatColorToggle = (color) => {
    setNewRoom(prev => {
      const newSeatColors = prev.seatColors.includes(color)
        ? prev.seatColors.filter(c => c !== color)
        : [...prev.seatColors, color];
      
      return {
        ...prev,
        seatColors: newSeatColors
      };
    });
  };

  // Save room (Add/Edit) - FIXED: Ensure proper ID handling
  const handleSaveRoom = (e) => {
    e.preventDefault();

    // Validation
    if (!newRoom.name || !newRoom.building || !newRoom.capacity) {
      alert('Please fill all required fields');
      return;
    }

    let updatedRooms;

    if (editRoom) {
      // Update existing room
      updatedRooms = rooms.map((room) =>
        room.id === editRoom.id ? { ...newRoom, id: editRoom.id } : room
      );
    } else {
      // Add new room with unique ID
      const newRoomWithId = { 
        ...newRoom, 
        id: Date.now(),
        capacity: parseInt(newRoom.capacity) || 0
      };
      updatedRooms = [...rooms, newRoomWithId];
    }

    console.log('Updated rooms:', updatedRooms); // Debug log
    setRooms(updatedRooms);
    resetForm();
    setShowForm(false);
  };

  // Edit Room
  const handleEdit = (room) => {
    setEditRoom(room);
    setNewRoom({
      ...room,
      capacity: room.capacity.toString() // Ensure capacity is string for input
    });
    setShowForm(true);
  };

  // Delete Room - FIXED: Ensure immediate persistence
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const updatedRooms = rooms.filter((room) => room.id !== id);
      setRooms(updatedRooms);
      // localStorage update happens automatically via useEffect
    }
  };

  // Clear used seat colors (for resetting room schedule)
  const clearUsedSeatColors = (roomId) => {
    const updatedRooms = rooms.map(room => 
      room.id === roomId 
        ? { ...room, usedSeatColors: [] }
        : room
    );
    setRooms(updatedRooms);
  };

  // Initialize with default rooms if empty - FIXED: Add a reset function
  const initializeDefaultRooms = () => {
    if (window.confirm('This will reset all rooms to default. Continue?')) {
      DataManager.clearAllData(); // Clear all data
      const defaultRooms = DataManager.getRooms(); // This will create default rooms
      setRooms(defaultRooms);
    }
  };

  return (
    <div className="manage-rooms-container">
      <h2 className="page-header">Manage Rooms & Seat Colors</h2>

      {/* Debug and Reset Section */}
      <div className="card" style={{marginBottom: '1rem', backgroundColor: '#fff3cd'}}>
        <div className="card-body">
          <h4>🛠️ Data Debug</h4>
          <p>Rooms in state: {rooms.length} | LocalStorage: {localStorage.getItem('liu_rooms') ? 'Exists' : 'Empty'}</p>
          <button 
            className="btn btn-warning btn-sm" 
            onClick={initializeDefaultRooms}
          >
            Reset to Default Rooms
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Rooms</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.available}</div>
          <div className="stat-label">Available Rooms</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalCapacity}</div>
          <div className="stat-label">Total Capacity</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalSeatColors}</div>
          <div className="stat-label">Total Seat Colors</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'rooms' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms')}
        >
          🏫 Rooms Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          🎨 Seat Colors Overview
        </button>
      </div>

      {activeTab === 'rooms' && (
        <>
          {/* Add Room Button */}
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            ➕ Add Room
          </button>

          {/* Add/Edit Form */}
          {showForm && (
            <div className="card form-card">
              <div className="card-header">
                <h3>{editRoom ? "Edit Room" : "Add Room"}</h3>
              </div>

              <div className="card-body">
                <form onSubmit={handleSaveRoom}>
                  {/* Room Name Dropdown */}
                  <div className="form-field">
                    <label>Room Name *</label>
                    <select
                      value={newRoom.name}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, name: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Room</option>
                      {roomNameOptions.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Building Dropdown */}
                  <div className="form-field">
                    <label>Building *</label>
                    <select
                      value={newRoom.building}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, building: e.target.value })
                      }
                      required
                    >
                      <option value="">Select Building</option>
                      {buildings.map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="form-field">
                    <label>Capacity *</label>
                    <input
                      type="number"
                      value={newRoom.capacity}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, capacity: e.target.value })
                      }
                      min="1"
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="form-field">
                    <label>Status *</label>
                    <select
                      value={newRoom.status}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, status: e.target.value })
                      }
                      required
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="maintenance">Under Maintenance</option>
                    </select>
                  </div>

                  {/* Seat Colors Selection */}
                  <div className="form-field">
                    <label>Available Seat Colors *</label>
                    <div className="seat-colors-selection">
                      {seatColorOptions.map(color => (
                        <div key={color} className="seat-color-option">
                          <input
                            type="checkbox"
                            id={`color-${color}`}
                            checked={newRoom.seatColors.includes(color)}
                            onChange={() => handleSeatColorToggle(color)}
                          />
                          <label 
                            htmlFor={`color-${color}`}
                            className={`seat-color-checkbox seat-color-${color.toLowerCase()}`}
                          >
                            {color}
                          </label>
                        </div>
                      ))}
                    </div>
                    <small>Selected {newRoom.seatColors.length} seat colors</small>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="btn btn-success">
                      {editRoom ? "Update Room" : "Add Room"}
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Rooms Table */}
          <div className="card">
            <div className="card-header">
              <h3>Rooms List ({rooms.length} rooms)</h3>
            </div>

            <div className="card-body">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Building</th>
                    <th>Capacity</th>
                    <th>Seat Colors</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {rooms.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data-message">
                        No rooms found. Click "Add Room" to create rooms or "Reset to Default Rooms" above.
                      </td>
                    </tr>
                  ) : (
                    rooms.map((room) => (
                      <tr key={room.id}>
                        <td>
                          <strong>{room.name}</strong>
                        </td>
                        <td>{room.building}</td>
                        <td>{room.capacity}</td>
                        <td>
                          <div className="seat-colors-display">
                            {room.seatColors.map(color => (
                              <span 
                                key={color} 
                                className={`seat-color-badge seat-color-${color.toLowerCase()}`}
                              >
                                {color}
                              </span>
                            ))}
                          </div>
                          {room.usedSeatColors && room.usedSeatColors.length > 0 && (
                            <div className="used-colors-info">
                              <small>
                                Used: {room.usedSeatColors.join(', ')}
                              </small>
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge ${
                            room.status === 'available' ? 'status-active' : 
                            room.status === 'occupied' ? 'status-warning' : 'status-danger'
                          }`}>
                            {room.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn btn-small btn-warning"
                              onClick={() => handleEdit(room)}
                            >
                              Edit
                            </button>

                            <button
                              className="btn btn-small btn-info"
                              onClick={() => clearUsedSeatColors(room.id)}
                              title="Clear used seat colors"
                            >
                              🔄
                            </button>

                            <button
                              className="btn btn-small btn-danger"
                              onClick={() => handleDelete(room.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'colors' && (
        <div className="card">
          <div className="card-header">
            <h3>Seat Colors Overview</h3>
          </div>
          <div className="card-body">
            <div className="seat-colors-dashboard">
              {rooms.length === 0 ? (
                <div className="no-data-message">
                  No rooms available. Add rooms first.
                </div>
              ) : (
                rooms.map(room => (
                  <div key={room.id} className="room-color-card">
                    <h4>{room.name} - {room.building}</h4>
                    <div className="color-availability">
                      <div className="available-colors">
                        <strong>Available Colors:</strong>
                        <div className="color-chips">
                          {room.seatColors.map(color => (
                            <span 
                              key={color}
                              className={`color-chip seat-color-${color.toLowerCase()} ${
                                room.usedSeatColors && room.usedSeatColors.includes(color) ? 'used' : 'available'
                              }`}
                              title={room.usedSeatColors && room.usedSeatColors.includes(color) ? 'Currently in use' : 'Available'}
                            >
                              {color}
                              {room.usedSeatColors && room.usedSeatColors.includes(color) && ' ✓'}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="room-info">
                        <div>Capacity: <strong>{room.capacity}</strong></div>
                        <div>Status: <span className={`status-text ${room.status}`}>{room.status}</span></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRooms;