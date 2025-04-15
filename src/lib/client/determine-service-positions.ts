import { Service } from '../types';

export type ServicePosition = {
  service: Service;
  x: number;
  z: number;
};

const getPositionKey = (x: number, z: number) =>
  `${Math.round(x)},${Math.round(z)}`;

const MIN_DISTANCE = 6; // 3 units structure + 3 units spacing
const MAX_SEARCH_RADIUS = 50;

export const determineServicePositions = (services: Service[]) => {
  const occupiedPositions = new Set<string>();
  const servicePositions: ServicePosition[] = [];

  const connectionCounts = new Map<string, number>(
    services.map((service) => [service.id, (service.connections || []).length])
  );

  // Sort services by connection count (hubs first)
  const sortedServices = [...services].sort(
    (a, b) =>
      (connectionCounts.get(b.id) || 0) - (connectionCounts.get(a.id) || 0)
  );

  // Place first hub at origin
  if (sortedServices.length > 0) {
    servicePositions.push({
      service: sortedServices[0],
      x: 0,
      z: 0,
    });
    occupiedPositions.add(getPositionKey(0, 0));
  }

  // Helper to get available position around a center point
  const findAvailablePosition = (
    centerX: number,
    centerZ: number,
    radius: number
  ): { x: number; z: number } | null => {
    // Define positions in grid pattern - cardinal directions first, then diagonals
    const positions = [
      { x: centerX + radius, z: centerZ }, // right
      { x: centerX, z: centerZ + radius }, // down
      { x: centerX - radius, z: centerZ }, // left
      { x: centerX, z: centerZ - radius }, // up
      { x: centerX + radius, z: centerZ + radius }, // right-down
      { x: centerX - radius, z: centerZ + radius }, // left-down
      { x: centerX - radius, z: centerZ - radius }, // left-up
      { x: centerX + radius, z: centerZ - radius }, // right-up
    ];

    for (const pos of positions) {
      if (!occupiedPositions.has(getPositionKey(pos.x, pos.z))) {
        return pos;
      }
    }
    return null;
  };

  // Place remaining services
  sortedServices.slice(1).forEach((service) => {
    const connections = service.connections || [];

    // Find connected services that are already placed
    const connectedPositions = connections
      .map((id) => servicePositions.find((pos) => pos.service.id === id))
      .filter((pos) => pos !== undefined);

    if (connectedPositions.length > 0) {
      // Calculate average position of connected services
      const avgX =
        connectedPositions.reduce((sum, pos) => sum + pos!.x, 0) /
        connectedPositions.length;
      const avgZ =
        connectedPositions.reduce((sum, pos) => sum + pos!.z, 0) /
        connectedPositions.length;

      // Try to find position around this average point
      let radius = MIN_DISTANCE;
      let position = null;

      while (!position && radius < MAX_SEARCH_RADIUS) {
        position = findAvailablePosition(avgX, avgZ, radius);
        radius += MIN_DISTANCE;
      }

      if (position) {
        servicePositions.push({
          service,
          x: position.x,
          z: position.z,
        });
        occupiedPositions.add(getPositionKey(position.x, position.z));
      }
    } else {
      // No connections, place in next available position from origin
      let radius = MIN_DISTANCE;
      let position = null;

      while (!position && radius < MAX_SEARCH_RADIUS) {
        position = findAvailablePosition(0, 0, radius);
        radius += MIN_DISTANCE;
      }

      if (position) {
        servicePositions.push({
          service,
          x: position.x,
          z: position.z,
        });
        occupiedPositions.add(getPositionKey(position.x, position.z));
      }
    }
  });

  return servicePositions;
};
