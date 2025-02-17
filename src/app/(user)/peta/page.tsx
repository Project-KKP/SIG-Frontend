'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { APIProvider, ControlPosition, MapControl, AdvancedMarker, Map, useMap, useMapsLibrary, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { PoiMarkersMenara } from '@/components/shared/poimarker';
import { Layers2, X } from 'lucide-react';
import { PoiMenara } from '@/components/shared/poimarker';
import { motion, AnimatePresence } from 'framer-motion';
import { Blankspot } from '@/components/shared/poimarker';

export default function Page() {
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  const variants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  const [dataTowers, setDataTowers] = useState<PoiMenara[]>([]);
  const [error, setError] = useState<Error | null>(null);

  const [isOpenMenu, setOpenMenu] = useState(true);
  const [isCheckedMenara, setCheckedMenara] = useState(true);
  const [isCheckedBlankspot, setCheckedBlankspot] = useState<boolean>(true);

  const [selectedOperators, setSelectedOperators] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleBlankspotChange = () => {
    setCheckedBlankspot((prev) => !prev);
  };

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_BASE_API_URL + '/api/towers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: PoiMenara[]) => {
        setDataTowers(data);
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  const handleOperatorChange = (operator: string) => {
    setSelectedOperators((prev) => (prev.includes(operator) ? prev.filter((item) => item !== operator) : [...prev, operator]));
    if (!isCheckedMenara) {
      setCheckedMenara(true);
    }
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatuses((prev) => (prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status]));
    if (!isCheckedMenara) {
      setCheckedMenara(true);
    }
  };

  const handleMenaraChange = () => {
    setCheckedMenara((prev) => !prev);
  };

  const filteredData = dataTowers.filter((item: PoiMenara) => (selectedOperators.length === 0 || selectedOperators.includes(item.operator)) && (selectedStatuses.length === 0 || selectedStatuses.includes(item.status)));

  return (
    <main className="max-h-screen pt-[4rem]">
      <div className="absolute w-max max-md:mt-28 p-3 rounded-md shadow-md mt-5 bg-white ms-3 cursor-pointer" onClick={() => setOpenMenu(true)}>
        <Layers2 />
      </div>
      <AnimatePresence>
        {isOpenMenu && (
          <motion.div
            key="content"
            initial="closed"
            animate="open"
            exit="closed"
            variants={variants}
            transition={{ duration: 0.2 }}
            className="border-r ms-3 mt-5 max-md:mt-28  rounded-md max-h-[30rem] overflow-hidden p-4 text-center md:w-72 absolute z-20 bg-white shadow-sm "
          >
            <div className="flex justify-between items-center pb-4">
              <div className="flex gap-4 items-center">
                <p className="font-bold text-xl">Layer Control</p>
              </div>
              <div className="cursor-pointer" onClick={() => setOpenMenu(false)}>
                <X />
              </div>
            </div>

            <div className="max-h-[25rem] overflow-y-auto filter">
              <div className="mt-4">
                <div className="py-1.5 font-bold w-full text-left border-b mb-4">Jenis Penanda</div>
                <div className="flex gap-4 items-center">
                  <input type="checkbox" checked={isCheckedMenara} onChange={handleMenaraChange} />
                  <p>Menara Telekomunikasi</p>
                </div>
                <div className="flex gap-4 items-center mt-3">
                  <input type="checkbox" checked={isCheckedBlankspot} onChange={handleBlankspotChange} />
                  <p>Lokasi Blankspot</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="py-1.5 font-bold w-full text-left border-b mb-4">Operator Menara</div>
                {['Telkomsel', 'XL', 'Indosat'].map((operator) => (
                  <div className="flex gap-4 items-center mt-3" key={operator}>
                    <input type="checkbox" onChange={() => handleOperatorChange(operator)} />
                    <p>{operator}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <div className="py-1.5 font-bold w-full text-left border-b mb-4">Status Menara</div>
                {['Aktif', 'Tidak Aktif'].map((status) => (
                  <div className="flex gap-4 items-center mt-3" key={status}>
                    <input type="checkbox" onChange={() => handleStatusChange(status)} />
                    <p>{status}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div>
        <div className="w-full h-screen mx-auto -z-10 fixed">
          <div className="w-full">
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}>
              <Map
                defaultZoom={11}
                defaultCenter={{ lat: -8.583333, lng: 116.116667 }}
                mapId="semidi2"
                style={{ width: '100%', height: '100vh' }}
                zoomControlOptions={{ position: ControlPosition.TOP_RIGHT || null }}
                streetViewControlOptions={{ position: ControlPosition.TOP_RIGHT }}
                mapTypeControlOptions={{ position: ControlPosition.TOP_RIGHT }}
              >
                {isCheckedMenara && <PoiMarkersMenara pois={filteredData} />}
                {isCheckedBlankspot && <Blankspot isVisible={isCheckedBlankspot} />}

                <AdvancedMarker ref={markerRef} position={null} />
                <MapControl position={ControlPosition.TOP}>
                  <div className="autocomplete-control mt-6 max-md:mt-14">
                    <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
                  </div>
                </MapControl>
                <MapHandler place={selectedPlace} marker={marker} />
              </Map>
            </APIProvider>
          </div>
        </div>
      </div>
    </main>
  );
}
interface MapHandlerProps {
  place: google.maps.places.PlaceResult | null;
  marker: google.maps.marker.AdvancedMarkerElement | null;
}

const MapHandler = ({ place, marker }: MapHandlerProps) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    if (place.geometry?.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else if (place.geometry?.location) {
      map.setCenter(place.geometry.location);
      map.setZoom(15);
    }
    marker.position = place.geometry?.location;
  }, [map, place, marker]);

  return null;
};

interface PlaceAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
}

const PlaceAutocomplete = ({ onPlaceSelect }: PlaceAutocompleteProps) => {
  const [placeAutocomplete, setPlaceAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const places = useMapsLibrary('places');

  useEffect(() => {
    if (!places || !inputRef.current) return;

    const options = {
      fields: ['geometry', 'name', 'formatted_address'],
    };

    setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
  }, [places]);

  useEffect(() => {
    if (!placeAutocomplete) return;

    placeAutocomplete.addListener('place_changed', () => {
      onPlaceSelect(placeAutocomplete.getPlace());
    });
  }, [onPlaceSelect, placeAutocomplete]);

  return (
    <div className="autocomplete-container">
      <Input type="text" placeholder="Cari lokasi" className="w-96 shadow-sm focus:border-blue-600 focus:outline-none outline-none transition-all duration-150" ref={inputRef} />
    </div>
  );
};
