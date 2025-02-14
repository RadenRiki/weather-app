// components/Weather.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './Weather.css';

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [city, setCity] = useState('Jakarta');
  const [activeLayer, setActiveLayer] = useState('temp_new');
  const [mapError, setMapError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
  const BASE_URL = 'https://api.openweathermap.org/data/2.5';
  const MAP_BASE = 'https://tile.openweathermap.org/map';

  // Layer yang tersedia untuk Free Tier
  const layers = [
    {
      id: 'temp_new',
      name: 'Temperatur (°C)',
      url: `${MAP_BASE}/temp_new/{z}/{x}/{y}.png?appid=${API_KEY}&date=${Math.floor(Date.now()/1000)}`
    },
    {
      id: 'pressure_new',
      name: 'Tekanan (hPa)',
      url: `${MAP_BASE}/pressure_new/{z}/{x}/{y}.png?appid=${API_KEY}`
    },
    {
      id: 'precipitation_new',
      name: 'Presipitasi',
      url: `${MAP_BASE}/precipitation_new/{z}/{x}/{y}.png?appid=${API_KEY}`
    },
    {
      id: 'clouds_new',
      name: 'Awan',
      url: `${MAP_BASE}/clouds_new/{z}/{x}/{y}.png?appid=${API_KEY}`
    },
    {
      id: 'wind_new',
      name: 'Angin (m/s)',
      url: `${MAP_BASE}/wind_new/{z}/{x}/{y}.png?appid=${API_KEY}`
    }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setMapError(null);
        
        const [current, forecast] = await Promise.all([
          axios.get(`${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`),
          axios.get(`${BASE_URL}/forecast?q=${city}&appid=${API_KEY}&units=metric`)
        ]);

        // Verifikasi struktur data
        if (!current.data?.main || !forecast.data?.list) {
          throw new Error('Struktur data API tidak valid');
        }

        setWeatherData(current.data);
        setForecastData(forecast.data);
      } catch (error) {
        console.error('Error:', error);
        setMapError(error.response?.data?.message || error.message || 'Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  return (
    <div className="weather-container">
      <form onSubmit={(e) => {
        e.preventDefault();
        setCity(e.target.city.value);
      }}>
        <input 
          name="city" 
          placeholder="Masukkan kota" 
          defaultValue={city}
          className="search-input"
        />
        <button type="submit" className="search-button">Cari</button>
      </form>

      {loading && <div className="loading">Memuat data...</div>}

      {weatherData && (
        <div className="current-weather">
          <h2>{weatherData.name}</h2>
          <p className="temperature">{Math.round(weatherData.main.temp)}°C</p>
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            className="weather-icon"
          />
          <p className="weather-condition">{weatherData.weather[0].description}</p>
        </div>
      )}

      <div className="map-container">
        {mapError && <div className="map-error">{mapError}</div>}
        
        <MapContainer
          center={[weatherData?.coord?.lat || -6.2, weatherData?.coord?.lon || 106.8]}
          zoom={5}
          scrollWheelZoom={true}
        >
          <TileLayer
            url={layers.find(l => l.id === activeLayer)?.url}
            attribution='© OpenWeatherMap'
            crossOrigin={true}
            eventHandlers={{
              tileerror: () => setMapError('Layer tidak tersedia untuk lokasi ini')
            }}
          />
        </MapContainer>

        <div className="layer-selector">
          {layers.map(layer => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`layer-button ${activeLayer === layer.id ? 'active' : ''}`}
            >
              {layer.name}
            </button>
          ))}
        </div>
      </div>

      <div className="forecast">
        <h3>Prediksi 24 Jam</h3>
        {forecastData ? (
          <div className="forecast-items">
            {forecastData?.list?.slice(0, 8).map((item, index) => (
              <div key={index} className="forecast-item">
                {/* SATU ITEM FORECAST */}
                <p className="forecast-time">
                  {new Date(item.dt * 1000).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
                <img
                  src={`https://openweathermap.org/img/wn/${item.weather[0].icon}.png`}
                  alt={item.weather[0].description}
                  className="forecast-icon"
                />
                <p className="forecast-temp">
                  {Math.round(item.main.temp)}°C
                </p>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="no-forecast">Data prediksi tidak tersedia</p>
        )}
      </div>
    </div>
  );
};

export default Weather;