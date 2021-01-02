import {ApiClient} from 'api-client';
import {useDispatch} from 'react-redux';

let apiClient: ApiClient;

export const useApiClient = () => {
    const dispatch = useDispatch();

    if (!apiClient) {
        apiClient = new ApiClient(dispatch);
    }

    return apiClient;
};
