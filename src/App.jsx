import { useState } from 'react';
import './App.css';

function App() {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const [banList, setBanList] = useState({
    camera: [],
    launch_date: [],
    earth_date: [],
  });

  const [seenPhotos, setSeenPhotos] = useState([]);


  const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

  const addToBanList = (attribute, value) => {
    if (!banList[attribute].includes(value)) {
      setBanList((prev) => ({
        ...prev,
        [attribute]: [...prev[attribute], value],
      }));
    }
  };

  const removeFromBanList = (attribute, value) => {
    setBanList((prev) => ({
      ...prev,
      [attribute]: prev[attribute].filter((v) => v !== value),
    }));
  };

  const fetchPhoto = async () => {
    try {
      const sol = Math.floor(Math.random() * 500) + 1000;
      const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&api_key=${ACCESS_KEY}`;

      const res = await fetch(url);

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();

      // Fallback if response is malformed or rate-limited
      if (!data || !Array.isArray(data.photos)) {
        throw new Error("Invalid API response (maybe rate-limited)");
      }

      const filtered = data.photos.filter(
        (p) =>
          !banList.camera.includes(p.camera.name) &&
          !banList.launch_date.includes(p.rover.launch_date) &&
          !banList.earth_date.includes(p.earth_date)
      );

      if (filtered.length === 0) {
        setError('No unbanned photos found for this sol.');
        setPhoto(null);
      } else {
        const randomIndex = Math.floor(Math.random() * filtered.length);
        const selectedPhoto = filtered[randomIndex];
        setPhoto(selectedPhoto);
        setSeenPhotos(prev => [selectedPhoto, ...prev]);
        setError(null);
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(err.message);
      setPhoto(null);
    }
  };


  return (
    <div className="app" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 Mars Rover Explorer</h1>
      <button onClick={fetchPhoto} style={{ padding: '10px 20px', margin: '10px 0' }}>
        Discover Mars
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {photo && (
        <div className="photo-display" style={{ marginTop: '20px' }}>
          <img
            src={photo.img_src}
            alt="Mars Rover"
            width="400"
            style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
          />
          <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
            <li>
              <strong>📅 Earth Date:</strong>{' '}
              <span
                onClick={() => addToBanList('earth_date', photo.earth_date)}
                style={{ cursor: 'pointer', color: 'blue' }}
              >
                {photo.earth_date}
              </span>
            </li>
            <li>
              <strong>📷 Camera:</strong>{' '}
              <span
                onClick={() => addToBanList('camera', photo.camera.name)}
                style={{ cursor: 'pointer', color: 'blue' }}
              >
                {photo.camera.full_name}
              </span>
            </li>
            <li>
              <strong>🚀 Launch Date:</strong>{' '}
              <span
                onClick={() => addToBanList('launch_date', photo.rover.launch_date)}
                style={{ cursor: 'pointer', color: 'blue' }}
              >
                {photo.rover.launch_date}
              </span>
            </li>
          </ul>
        </div>
      )}

      {/* Ban List */}
      <div style={{ marginTop: '30px' }}>
        <h3>🛑 Ban List</h3>
        {['camera', 'launch_date', 'earth_date'].map((attr) => (
          <div key={attr} style={{ marginBottom: '10px' }}>
            <strong>{attr}:</strong>{' '}
            {banList[attr].length === 0 ? (
              <span style={{ color: '#aaa' }}>none</span>
            ) : (
              banList[attr].map((value) => (
                <span
                  key={value}
                  onClick={() => removeFromBanList(attr, value)}
                  style={{
                    background: '#fee',
                    color: '#d00',
                    padding: '4px 8px',
                    margin: '0 5px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'inline-block',
                  }}
                >
                  {value} ❌
                </span>
              ))
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', marginTop: '40px' }}>
      {/* Sidebar */}
      <div style={{
        width: '120px',
        height: '400px',
        overflowY: 'auto',
        borderRight: '1px solid #ccc',
        paddingRight: '10px',
        marginRight: '20px'
      }}>
        <h4 style={{ textAlign: 'center' }}>🖼️ Gallery</h4>
        {seenPhotos.map((p, idx) => (
          <img
            key={idx}
            src={p.img_src}
            alt={`Thumbnail ${idx}`}
            width="100"
            style={{ marginBottom: '10px', cursor: 'pointer', borderRadius: '6px' }}
            onClick={() => setPhoto(p)} // Optional: click to view
          />
        ))}
      </div>

        {/* Main Image Area */}
        <div>
          {photo && (
            <div>
              <img
                src={photo.img_src}
                alt="Mars Rover"
                width="400"
                style={{ borderRadius: '10px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
              />
              {/* ...other attributes here */}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default App;
