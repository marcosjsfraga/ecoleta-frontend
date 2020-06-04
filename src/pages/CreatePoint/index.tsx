import React, { useEffect, useState, ChangeEvent } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse {
    sigla: string;
}

interface IBGECityResponse {
    nome: string;
}

const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string []>([]);
    const [cities, setCities] = useState<string []>([]);
    
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
         whatsapp: ''
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            setInitialPosition([ latitude, longitude ]);
        });
    }, []);

    // Retorna items coletados
    useEffect(() => {
        api.get('items').then(response => {
            setItems(response.data);
        });
    }, []);
    
    // Retorna UF da API do IBGE
    useEffect(() => {
        axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        });
    }, []);
    
    // Retorna Cidades da API do IBGE quando o estado é selecionados
    useEffect(() => {
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        });        
     }, [selectedUf]);

     function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
        const uf = event.target.value;
        setSelectedUf(uf);
     }

     function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
        const city = event.target.value;
        setSelectedCity(city);
     }

     function handleMapClick(event: LeafletMouseEvent) {
        setSelectedPosition([ event.latlng.lat, event.latlng.lng ]); 
     }

     function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
        const { name, value } = event.target; 
     }

     return(
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta"/>
                <Link to="/">
                    <FiArrowLeft />
                    Voltar para Home
                </Link>
            </header>

            <form action="">
                <h1>Cadastro do <br/> ponto de coleta</h1>

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>

                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input id="name" name="name" onChange={handleInputChange} type="text"/>
                    </div>
                    
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="name">Email</label>
                            <input id="email" name="email" onChange={handleInputChange} type="text"/>
                        </div>
                        <div className="field">
                            <label htmlFor="whatsapp">Whatsapp</label>
                            <input id="whatsapp" name="whatsapp" onChange={handleInputChange}  type="text"/>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>

                    {/* [-29.9322442, -51.1689972] */}
                    <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
                        <TileLayer 
                            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={selectedPosition} />
                    </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select id="uf" name="uf" value={selectedUf} onChange={handleSelectUf}>
                               <option value="0">Selecione uma UF</option>
                               {ufs.map(uf => (
                                   <option key={uf} value={uf}>{uf}</option> 
                               ))}
                            </select>
                        </div>
                        <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select id="city" name="city" value={selectedCity} onChange={handleSelectCity}>
                               <option value="0">Selecione uma cidade</option> 
                               {cities.map(city => (
                                   <option key={city} value={city}>{city}</option> 
                               ))}
                            </select>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais ítens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li key={item.id}>
                                <img src={item.image_url} alt={item.title}/>
                                <span>{item.title}</span>
                            </li>
                        ))}
                    </ul>
                </fieldset>

                <button type="submit">
                    Cadastrar ponto de coleta
                </button>
            </form>
        </div>
    );
};

export default CreatePoint;