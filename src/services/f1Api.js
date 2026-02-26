import axios from 'axios';

const BASE_URL = 'https://api.openf1.org/v1';

export const f1Service = {
    // Current positions of all cars for the track map
    getLocations: (sessionKey) => axios.get(`${BASE_URL}/location?session_key=${sessionKey}`),

    // Live car performance (RPM, Speed, Gear, DRS)
    getCarData: (sessionKey, driverNum) => axios.get(`${BASE_URL}/car_data?session_key=${sessionKey}&driver_number=${driverNum}`),

    // Gap to leader and intervals
    getIntervals: (sessionKey) => axios.get(`${BASE_URL}/intervals?session_key=${sessionKey}`),

    // Transcribed Team Radio
    getRadio: (sessionKey) => axios.get(`${BASE_URL}/team_radio?session_key=${sessionKey}`),

    // Live Weather terminal
    getWeather: (sessionKey) => axios.get(`${BASE_URL}/weather?session_key=${sessionKey}`)
};