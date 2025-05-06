export interface Location {
  id: string;
  name: string;
  description: string;
  connections: Record<string, {
    locationId: string;
    message?: string;
    requirements?: Array<{
      type: 'item' | 'flag';
      value: string;
    }>;
  }>;
  items?: string[];
}

// Game locations definition
export const locations: Record<string, Location> = {
  start: {
    id: 'start',
    name: 'Starting Area',
    description: 'You are at the beginning of your Git adventure journey.',
    connections: {
      north: {
        locationId: 'forest',
        message: 'You traveled north to the Git Forest.'
      },
      east: {
        locationId: 'village',
        message: 'You traveled east to the Git Village.'
      }
    },
    items: ['map']
  },
  forest: {
    id: 'forest',
    name: 'Git Forest',
    description: 'A dense forest with many branching paths.',
    connections: {
      south: {
        locationId: 'start',
        message: 'You traveled south back to the Starting Area.'
      },
      east: {
        locationId: 'cave',
        message: 'You traveled east to the Mysterious Cave.',
        requirements: [
          { type: 'item', value: 'lantern' }
        ]
      }
    },
    items: ['branch', 'lantern']
  },
  village: {
    id: 'village',
    name: 'Git Village',
    description: 'A small village where Git masters gather to share knowledge.',
    connections: {
      west: {
        locationId: 'start',
        message: 'You traveled west back to the Starting Area.'
      },
      north: {
        locationId: 'mountain',
        message: 'You traveled north to the Commit Mountain.',
        requirements: [
          { type: 'flag', value: 'basic_training_complete' }
        ]
      }
    }
  },
  cave: {
    id: 'cave',
    name: 'Mysterious Cave',
    description: 'A dark cave with hidden Git secrets.',
    connections: {
      west: {
        locationId: 'forest',
        message: 'You traveled west back to the Git Forest.'
      }
    },
    items: ['stash']
  },
  mountain: {
    id: 'mountain',
    name: 'Commit Mountain',
    description: 'A tall mountain with a history of all Git commits.',
    connections: {
      south: {
        locationId: 'village',
        message: 'You traveled south back to the Git Village.'
      }
    }
  }
};