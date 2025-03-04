import axios, { AxiosInstance } from 'axios';
import { FreeAgentConfig, Timeslip, TimeslipAttributes, TimeslipsResponse, TimeslipResponse } from './types.js';

export class FreeAgentClient {
    private axiosInstance: AxiosInstance;
    private config: FreeAgentConfig;

    constructor(config: FreeAgentConfig) {
        this.config = config;
        this.axiosInstance = axios.create({
            baseURL: 'https://api.freeagent.com/v2',
            headers: {
                'Authorization': `Bearer ${config.accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        // Add response interceptor for token refresh
        this.axiosInstance.interceptors.response.use(
            response => response,
            async error => {
                if (error.response?.status === 401) {
                    await this.refreshToken();
                    error.config.headers['Authorization'] = `Bearer ${this.config.accessToken}`;
                    return this.axiosInstance.request(error.config);
                }
                return Promise.reject(error);
            }
        );
    }

    private async refreshToken() {
        try {
            const response = await axios.post('https://api.freeagent.com/v2/token_endpoint', {
                grant_type: 'refresh_token',
                refresh_token: this.config.refreshToken,
                client_id: this.config.clientId,
                client_secret: this.config.clientSecret
            });

            this.config.accessToken = response.data.access_token;
            this.config.refreshToken = response.data.refresh_token;

            this.axiosInstance.defaults.headers['Authorization'] = `Bearer ${this.config.accessToken}`;

            console.error('[Auth] Successfully refreshed access token');
        } catch (error) {
            console.error('[Auth] Failed to refresh token:', error);
            throw error;
        }
    }

    async listTimeslips(params?: {
        from_date?: string;
        to_date?: string;
        updated_since?: string;
        view?: 'all' | 'unbilled' | 'running';
        user?: string;
        task?: string;
        project?: string;
        nested?: boolean;
    }): Promise<Timeslip[]> {
        try {
            console.error('[API] Fetching timeslips with params:', params);
            const response = await this.axiosInstance.get<TimeslipsResponse>('/timeslips', { params });
            return response.data.timeslips;
        } catch (error) {
            console.error('[API] Failed to fetch timeslips:', error);
            throw error;
        }
    }

    async getTimeslip(id: string): Promise<Timeslip> {
        try {
            console.error('[API] Fetching timeslip:', id);
            const response = await this.axiosInstance.get<TimeslipResponse>(`/timeslips/${id}`);
            return response.data.timeslip;
        } catch (error) {
            console.error('[API] Failed to fetch timeslip:', error);
            throw error;
        }
    }

    async createTimeslip(timeslip: TimeslipAttributes): Promise<Timeslip> {
        try {
            console.error('[API] Creating timeslip:', timeslip);
            const response = await this.axiosInstance.post<TimeslipResponse>('/timeslips', {
                timeslip
            });
            return response.data.timeslip;
        } catch (error) {
            console.error('[API] Failed to create timeslip:', error);
            throw error;
        }
    }

    async createTimeslips(timeslips: TimeslipAttributes[]): Promise<Timeslip[]> {
        try {
            console.error('[API] Creating multiple timeslips:', timeslips);
            const response = await this.axiosInstance.post<TimeslipsResponse>('/timeslips', {
                timeslips
            });
            return response.data.timeslips;
        } catch (error) {
            console.error('[API] Failed to create timeslips:', error);
            throw error;
        }
    }

    async updateTimeslip(id: string, timeslip: Partial<TimeslipAttributes>): Promise<Timeslip> {
        try {
            console.error('[API] Updating timeslip:', id, timeslip);
            const response = await this.axiosInstance.put<TimeslipResponse>(`/timeslips/${id}`, {
                timeslip
            });
            return response.data.timeslip;
        } catch (error) {
            console.error('[API] Failed to update timeslip:', error);
            throw error;
        }
    }

    async deleteTimeslip(id: string): Promise<void> {
        try {
            console.error('[API] Deleting timeslip:', id);
            await this.axiosInstance.delete(`/timeslips/${id}`);
        } catch (error) {
            console.error('[API] Failed to delete timeslip:', error);
            throw error;
        }
    }

    async startTimer(id: string): Promise<Timeslip> {
        try {
            console.error('[API] Starting timer for timeslip:', id);
            const response = await this.axiosInstance.post<TimeslipResponse>(`/timeslips/${id}/timer`);
            return response.data.timeslip;
        } catch (error) {
            console.error('[API] Failed to start timer:', error);
            throw error;
        }
    }

    async stopTimer(id: string): Promise<Timeslip> {
        try {
            console.error('[API] Stopping timer for timeslip:', id);
            const response = await this.axiosInstance.delete<TimeslipResponse>(`/timeslips/${id}/timer`);
            return response.data.timeslip;
        } catch (error) {
            console.error('[API] Failed to stop timer:', error);
            throw error;
        }
    }
}
