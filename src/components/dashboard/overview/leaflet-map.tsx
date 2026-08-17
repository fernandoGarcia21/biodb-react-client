'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { paths } from '@/paths';

interface LeafletMapProps {
  samplingAreasCoordinates: { id: number; 
                            name: string; 
                            latitude: number; 
                            longitude: number; 
                            number_individuals: number,
                            habitat_name: string }[];
  mapHeight?: number;
}

export function LeafletMap({ samplingAreasCoordinates, mapHeight = 320 }: LeafletMapProps): React.JSX.Element {
  const theme = useTheme();

  const markersWithJitter = React.useMemo(() => {
    const groupedByCoordinate = new Map<string, typeof samplingAreasCoordinates>();

    samplingAreasCoordinates.forEach((item) => {
      const key = `${item.latitude.toFixed(7)}|${item.longitude.toFixed(7)}`;
      const existing = groupedByCoordinate.get(key) ?? [];
      existing.push(item);
      groupedByCoordinate.set(key, existing);
    });

    const markerList: Array<{ key: string; id: number; name: string; latitude: number; longitude: number; number_individuals: number; habitat_name: string }> = [];
    const jitterStep = 0.00005;

    groupedByCoordinate.forEach((group, key) => {
      if (group.length === 1) {
        const item = group[0];
        markerList.push({ key: `${item.id}-${key}`, id: item.id, name: item.name, latitude: item.latitude, longitude: item.longitude, number_individuals: item.number_individuals, habitat_name: item.habitat_name });
        return;
      }

      const angleStep = (2 * Math.PI) / group.length;
      group.forEach((item, index) => {
        const angle = index * angleStep;
        const radius = jitterStep * Math.ceil((index + 1) / 6);
        markerList.push({
          key: `${item.id}-${key}-${index}`,
          id: item.id,
          name: item.name,
          latitude: item.latitude - radius * Math.sin(angle),
          longitude: item.longitude - radius * Math.cos(angle),
          number_individuals: item.number_individuals,
          habitat_name: item.habitat_name,
        });
      });
    });

    return markerList;
  }, [samplingAreasCoordinates]);

  const mapBounds = React.useMemo(() => {
    if (markersWithJitter.length > 0) {
      const lats = markersWithJitter.map((item) => item.latitude);
      const lngs = markersWithJitter.map((item) => item.longitude);

      return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ] as [[number, number], [number, number]];
    }

    // Default view: centered closer to Europe and North America.
    return [
      [53, -90],
      [60, 20],
    ] as [[number, number], [number, number]];
  }, [markersWithJitter]);

  const tileLayerConfig = React.useMemo(() => {
    if (theme.palette.mode === 'dark') {
      return {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      };
    }

    return {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };
  }, [theme.palette.mode]);

  return (
    <Box sx={{ height: mapHeight, width: '100%', borderRadius: 1, overflow: 'hidden' }}>
      <MapContainer bounds={mapBounds} boundsOptions={{ padding: [24, 24] }} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution={tileLayerConfig.attribution}
          url={tileLayerConfig.url}
        />
        {markersWithJitter.map((item) => (
          <CircleMarker key={item.key} center={[item.latitude, item.longitude]} radius={6}>
            <Popup>
              <Link
                component={RouterLink}
                href={paths.dashboard.samplingAreaDisplay(Number(item.id))}
                variant="subtitle1"
                underline="hover"
                sx={{ display: 'block', textAlign: 'center', lineHeight: 1.2, mb: 0.25 }}
              >
                {item.name}
              </Link>
              <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2, mb: 0.25 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>Habitat:</Box> {item.habitat_name}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'left', lineHeight: 1.2, mb: 0.25 }}>
                <Box component="span" sx={{ fontWeight: 700 }}>Individuals:</Box> {item.number_individuals}
              </Typography>
              <Button
                component={RouterLink}
                href={paths.dashboard.organisms({ samplingAreaId: item.id })}
                size="small"
                variant="outlined"
                sx={{ display: 'block', mx: 'auto', textAlign: 'center' }}
              >
                Go to Organisms
              </Button>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </Box>
  );
}
