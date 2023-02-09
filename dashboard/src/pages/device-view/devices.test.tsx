import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DeviceView from './device-view';

describe('<Devices />', () => {
    test('it should mount', () => {
        render(<DeviceView />);

        const devices = screen.getByTestId('devices');

        expect(devices).toBeInTheDocument();
    });
});