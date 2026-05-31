import './LoadingSpinner.scss';

const LoadingSpinner = ({ message = "Loading..." }) => {
    return (
        <main className="loading-container">
            <div className="spinner-wrapper">
                <div className="spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p className="loading-text">{message}</p>
            </div>
        </main>
    );
};

export default LoadingSpinner;