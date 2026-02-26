import { useState, useEffect } from 'react';
import { neuralFetch } from '../utils/neuralFetch';

const TMDB_KEY = '36735721fd11df6180fe9deb66795321'; // Get this from themoviedb.org



export const useMovies = (endpoint) => {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const fetchMovies = async () => {
            const { data } = await neuralFetch(`${endpoint}`);
            setMovies(data.results);
        };
        fetchMovies();
    }, [endpoint]);

    return movies;
};