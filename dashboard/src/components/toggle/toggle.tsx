const Toggle = (props: { value: number }) => {
    const { value } = props;
    return (
        <div className="state d-flex align-items-center justify-content-center">
            <div
                className={`${
                    value === 1 ? 'bg-green active' : 'bg-black bg-opacity-25'
                } d-flex align-items-center toggle-button d-flex rounded-pill`}
            >
                <div className="button-head bg-white rounded-circle" />
            </div>
        </div>
    );
};

export default Toggle;
