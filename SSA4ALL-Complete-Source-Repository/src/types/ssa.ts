export type AssetType = 'Satellite' | 'Debris' | 'Payload' | 'Rocket Body' | 'Space Station';
export type AssetStatus = 'Active' | 'Defunct' | 'Decayed' | 'Critical' | 'Maneuvering';
export type AgencySource = 'NASA (ODPO)' | 'ESA' | 'JAXA' | 'ISRO' | 'USSPACECOM' | 'CelesTrak' | 'TinyGS' | 'SatNOGS' | 'MASCARA';
export type RiskLevel = 'CRITICAL' | 'WARNING' | 'ELEVATED' | 'NOMINAL';

export interface CalculatedPosition {
  lat: number;       // Latitude in degrees (-90 to +90)
  lon: number;       // Longitude in degrees (-180 to +180)
  alt: number;       // Altitude in kilometers
  velocity: number;  // Orbital speed in km/s
  eci?: {
    x: number;       // km
    y: number;       // km
    z: number;       // km
  };
  ecf?: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: string; // ISO string
}

export interface SpaceAsset {
  id: string;
  name: string;
  noradId: number;
  tleLine1: string;
  tleLine2: string;
  calculatedPos: CalculatedPosition;
  type: AssetType;
  status: AssetStatus;
  agencySource: AgencySource;
  orbitClass: 'LEO' | 'MEO' | 'GEO' | 'HEO' | 'SSO';
  inclination: number;     // degrees
  period: number;          // minutes
  apogee: number;          // km
  perigee: number;         // km
  massKg: number;
  radarCrossSection: number; // m^2
  historicalPositions?: Array<[number, number, number]>; // [lat, lon, alt]
  predictedPositions?: Array<[number, number, number]>;
}

export interface ConjunctionEvent {
  id: string;
  primaryAssetId: string;
  primaryAssetName: string;
  chaserDebrisId: string;
  chaserDebrisName: string;
  missDistance: number;      // in meters or kilometers
  missDistanceRadial: number;
  missDistanceInTrack: number;
  missDistanceCrossTrack: number;
  pc: number;                // Probability of Collision (0 to 1)
  tca: string;               // Time of Closest Approach (ISO String)
  relativeVelocity: number;  // km/s
  riskLevel: RiskLevel;
  maneuverRecommended: boolean;
  maneuverStatus: 'PENDING' | 'CALCULATING' | 'EXECUTING' | 'AVOIDED' | 'DISMISSED';
  requiredDeltaV?: number;   // m/s
  suggestedBurnEpoch?: string;
  projectedNewPc?: number;
}

export type SensorType = 'Phased Array Radar' | 'Optical Telescope' | 'Deep Space Radar' | 'Laser Ranging (SLR)' | 'TinyGS LoRa Ground Station' | 'SatNOGS Open Station' | 'MASCARA All-Sky Camera';

export interface SensorStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
  altMeters: number;
  type: SensorType;
  rangeKm: number;
  fovDegrees: number;
  isTracking: boolean;
  activeTargetId?: string;
  activeTargetName?: string;
  snrDb: number;            // Signal-to-Noise Ratio (dB)
  azimuthDeg: number;       // Azimuth (0 - 360 deg)
  elevationDeg: number;     // Elevation (0 - 90 deg)
  linkBudgetDb: number;     // Link Budget (dB)
  frequencyGhz: number;
  country: string;
  agency: AgencySource;
}

// --- TinyGS Global LoRa Ground Station Data Types ---
export interface TinyGSPacket {
  id: string;
  stationId: string;
  stationName: string;
  stationLat: number;
  stationLon: number;
  satelliteNorad: number;
  satelliteName: string;
  frequencyMhz: number;
  rssi: number;             // e.g. -118 dBm
  snr: number;              // e.g. +7.5 dB
  spreadingFactor: string;  // e.g. SF7, SF10
  bandwidthKhz: number;     // e.g. 125 kHz
  crcStatus: 'VALID' | 'ERROR';
  receivedAt: string;
  decodedTelemetry: {
    batteryVoltageV: number;
    solarPanelCurrentMa: number;
    obcTemperatureC: number;
    gyroRatesDegS: [number, number, number];
    magnetometerUt: [number, number, number];
    resetCount: number;
  };
}

// --- SatNOGS Network SDR Observation Types ---
export interface SatNOGSObservation {
  observationId: string;
  groundStationId: number;
  groundStationName: string;
  country: string;
  satelliteName: string;
  noradId: number;
  transmitterFreqMhz: number;
  modulation: 'AFSK 1k2' | 'GFSK 9k6' | 'BPSK 4k8' | 'LoRa SF10' | 'CW Beacon';
  status: 'Good Observation' | 'Transmitting' | 'Processing' | 'Scheduled';
  startUtc: string;
  endUtc: string;
  waterfallUrl?: string;
  maxElevationDeg: number;
  dopplerShiftKhz: number;
  framesDecoded: number;
}

// --- MASCARA All-Sky Optical Telescope Astrometry Types ---
export interface MASCARADetection {
  detectionId: string;
  observatorySite: 'MASCARA North (La Palma)' | 'MASCARA South (La Silla)';
  cameraIndex: number;
  targetNorad: number;
  targetName: string;
  epochUtc: string;
  rightAscensionDeg: number;  // RA (0 - 360 deg)
  declinationDeg: number;     // Dec (-90 to +90 deg)
  apparentMagnitude: number;  // Visual Mag (e.g. +4.2)
  tumblePeriodSeconds: number; // Optical Photometric Light Curve period
  streakLengthPixels: number;
  streakAngleDeg: number;
  astrometricResidualArcsec: number;
}

export interface CopilotCommand {
  trigger: string;
  actionType: 'LAYOUT_FOCUS' | 'CAMERA_TARGET' | 'FILTER_ASSETS' | 'OVERRIDE_SAFETY' | 'MANEUVER_EXEC' | 'GENERATE_REPORT' | 'SIMULATE_FLUX' | 'SENSOR_TASK';
  payloadDescription: string;
  macroFunction: (param?: string) => void;
  example: string;
}

export interface MultiphysicsTelemetry {
  assetId: string;
  assetName: string;
  thermalGradientC: number;
  solarFluxWPerM2: number;
  radiationDoseKrad: number;
  lensOcclusionPercent: number;
  antennaGainDbi: number;
  powerBusVolts: number;
  batterySocPercent: number;
  panelTemperatureC: number;
  coreTemperatureC: number;
  gyroDriftDegPerHr: number;
}

export interface UniversalTelemetryStreamPacket {
  id: string;
  timestamp: string;
  agency: AgencySource;
  event: 'ORBIT_UPDATE' | 'CONJUNCTION_ALERT' | 'RADAR_ACQUISITION' | 'TLE_INGEST' | 'MANEUVER_CONFIRMATION' | 'ANOMALY_DETECT';
  targetNorad: number;
  targetName: string;
  dataSummary: string;
  classification: 'UNCLASSIFIED' | 'RESTRICTED' | 'SECRET' | 'COSMIC TOP SECRET';
  rawPayload?: Record<string, unknown>;
}

export interface OpenSSA_MultiAgencyHandoffReport {
  reportHeader: {
    reportId: string;
    originatingAgency: AgencySource;
    coordinatingAgencies: AgencySource[];
    timestampUtc: string;
    securityClassification: 'UNCLASSIFIED' | 'RESTRICTED' | 'NATO SECRET' | 'MULTI-AGENCY CONFIDENTIAL';
    complianceProtocol: string;
    systemVersion: string;
  };
  executiveSummary: {
    totalTrackedObjects: number;
    activeSatellites: number;
    catalogedDebris: number;
    criticalConjunctionsCount: number;
    operationalSensorsOnline: number;
    networkCoverageEfficiency: string;
  };
  activeConjunctions: Array<{
    conjunctionId: string;
    primaryObject: { id: string; name: string; norad: number };
    secondaryObject: { id: string; name: string; norad: number };
    missDistanceKm: number;
    collisionProbability: number;
    tcaUtc: string;
    recommendedManeuverDeltaV_ms: number;
    status: string;
  }>;
  sensorNetworkStatus: Array<{
    sensorId: string;
    stationName: string;
    country: string;
    operationalState: 'TRACKING' | 'SEARCH' | 'CALIBRATING' | 'OFFLINE';
    activeTargetNorad?: number;
    snrMargin: string;
  }>;
  orbitalEphemerisCatalog: Array<{
    noradId: number;
    assetName: string;
    type: AssetType;
    epochUtc: string;
    positionGeodetic: {
      latitudeDeg: number;
      longitudeDeg: number;
      altitudeKm: number;
    };
    orbitalVelocityKmS: number;
    inclinationDeg: number;
  }>;
}
