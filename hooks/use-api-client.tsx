import {ApiClient} from 'api-client';
import {useDispatch, useStore} from 'react-redux';
import {useLoggedInPlayer} from './use-logged-in-player';

let apiClient: ApiClient;

export const useApiClient = () => {
    const dispatch = useDispatch();
    const loggedInPlayer = useLoggedInPlayer();
    const store = useStore();

    if (!apiClient) {
        apiClient = new ApiClient(dispatch, loggedInPlayer.username, store);
    }

    return apiClient;
};
