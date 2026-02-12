import {
  PRESET_STRETCHES,
  BODY_PART_LABELS,
  getStretchesByBodyPart,
  getStretchById,
  formatDuration,
  DURATION_OPTIONS,
} from '@/utils/presets';

describe('presets', () => {
  describe('PRESET_STRETCHES', () => {
    it('should have valid stretch items', () => {
      expect(PRESET_STRETCHES.length).toBeGreaterThan(0);
      
      PRESET_STRETCHES.forEach((stretch) => {
        expect(stretch.id).toBeDefined();
        expect(stretch.name).toBeDefined();
        expect(stretch.bodyPart).toBeDefined();
        expect(stretch.defaultDuration).toBeGreaterThan(0);
        expect(stretch.description).toBeDefined();
        expect(stretch.emoji).toBeDefined();
      });
    });

    it('should have unique ids', () => {
      const ids = PRESET_STRETCHES.map((s) => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid body parts', () => {
      const validBodyParts = Object.keys(BODY_PART_LABELS);
      PRESET_STRETCHES.forEach((stretch) => {
        expect(validBodyParts).toContain(stretch.bodyPart);
      });
    });
  });

  describe('getStretchesByBodyPart', () => {
    it('should return stretches for shoulder', () => {
      const stretches = getStretchesByBodyPart('shoulder');
      expect(stretches.length).toBeGreaterThan(0);
      stretches.forEach((s) => {
        expect(s.bodyPart).toBe('shoulder');
      });
    });

    it('should return stretches for neck', () => {
      const stretches = getStretchesByBodyPart('neck');
      expect(stretches.length).toBeGreaterThan(0);
      stretches.forEach((s) => {
        expect(s.bodyPart).toBe('neck');
      });
    });

    it('should return stretches for all body parts', () => {
      const bodyParts = ['shoulder', 'neck', 'waist', 'legs', 'arms', 'back', 'full'] as const;
      bodyParts.forEach((part) => {
        const stretches = getStretchesByBodyPart(part);
        expect(stretches.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getStretchById', () => {
    it('should return stretch by valid id', () => {
      const stretch = getStretchById('shoulder-roll');
      expect(stretch).toBeDefined();
      expect(stretch?.id).toBe('shoulder-roll');
      expect(stretch?.name).toBe('肩回し');
    });

    it('should return undefined for invalid id', () => {
      const stretch = getStretchById('non-existent');
      expect(stretch).toBeUndefined();
    });
  });

  describe('formatDuration', () => {
    it('should format seconds only', () => {
      expect(formatDuration(30)).toBe('30秒');
      expect(formatDuration(45)).toBe('45秒');
    });

    it('should format minutes only', () => {
      expect(formatDuration(60)).toBe('1分');
      expect(formatDuration(120)).toBe('2分');
      expect(formatDuration(180)).toBe('3分');
    });

    it('should format minutes and seconds', () => {
      expect(formatDuration(90)).toBe('1分30秒');
      expect(formatDuration(75)).toBe('1分15秒');
      expect(formatDuration(150)).toBe('2分30秒');
    });
  });

  describe('DURATION_OPTIONS', () => {
    it('should have expected duration options', () => {
      expect(DURATION_OPTIONS).toContain(30);
      expect(DURATION_OPTIONS).toContain(60);
      expect(DURATION_OPTIONS).toContain(120);
      expect(DURATION_OPTIONS).toContain(180);
    });

    it('should be in ascending order', () => {
      for (let i = 1; i < DURATION_OPTIONS.length; i++) {
        expect(DURATION_OPTIONS[i]).toBeGreaterThan(DURATION_OPTIONS[i - 1]);
      }
    });
  });
});
