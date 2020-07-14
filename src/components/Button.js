import React from 'react';
import LoadingIcon from '../assets/images/loading.svg'

const Button = props => {

    const {
        children,
        isLoading,
        onClick
    } = props;

    return (
        <button className={`btn-general ${isLoading ? 'btn-loading' : ''}`} onClick={onClick}>
            {isLoading && <img src={LoadingIcon} alt="photos"/>}
            {isLoading ? <span>{children}</span> : children}
        </button>
    );
};

export default Button;