import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DeviceForm from './device-pin-data';

describe('<DevicePinData />', () => {
    test('it should mount', () => {
        render(<DeviceForm />);

        const devicePinData = screen.getByTestId('DevicePinData');

        expect(devicePinData).toBeInTheDocument();
    });
});
