import { queryClient } from './queryClient';
import { getMeApi } from '../features/auth/services/auth.api.js';
import { redirect } from 'react-router-dom';
export const authQuery = () => ({
  queryKey: ["user"],
  queryFn: getMeApi,
  staleTime: 1000 * 60 * 30,
  gcTime: 1000 * 60 * 60,
  refetchOnWindowFocus: false,
  retry: false
});
export const protectedLoader = async () => {
  const query = authQuery();
  const isCached = queryClient.getQueryData(query.queryKey);
  const startTime = Date.now();
  try {
    const data = await queryClient.fetchQuery(query);
    if (!isCached) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(res => setTimeout(res, 500 - elapsed));
      }
    }
    return data;
  } catch (error) {
    if (!isCached) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(res => setTimeout(res, 500 - elapsed));
      }
    }
    throw redirect('/login');
  }
};
export const publicLoader = async () => {
  const query = authQuery();
  const isCached = queryClient.getQueryData(query.queryKey);
  const startTime = Date.now();
  try {
    const data = await queryClient.fetchQuery(query);
    if (!isCached) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(res => setTimeout(res, 500 - elapsed));
      }
    }
    if (data?.data) {
      throw redirect('/dashboard');
    }
    return data;
  } catch (error) {
    if (!isCached) {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(res => setTimeout(res, 500 - elapsed));
      }
    }
    if (error instanceof Response) {
      throw error;
    }
    return null;
  }
};
