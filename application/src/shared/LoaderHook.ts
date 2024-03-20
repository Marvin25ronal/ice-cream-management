import { useState } from "react";

export const useLoading = () => {
    const [loadingState, setLoadingState] = useState(false);
    const toggleLoading = () => setLoadingState(!loadingState);
    const setTrueLoading = () => setLoadingState(true);
    const setFalseLoading = () => setLoadingState(false);
    return { loadingState, toggleLoading, setTrueLoading, setFalseLoading };
}