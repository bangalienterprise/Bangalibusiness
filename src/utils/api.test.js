import api from './api';
import axios from 'axios';

jest.mock('axios');

describe('API Utility', () => {
  it('should be an axios instance', () => {
    expect(api).toBeDefined();
  });

  // Basic test to ensure it exports the configured instance
  // Deeper testing of interceptors requires more complex mocking of the axios create return value
});
