import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import Devices from './devices';

describe('<Devices />', () => {
    test('it should mount', () => {
        render(<Devices />);

        const devices = screen.getByTestId('devices');

        expect(devices).toBeInTheDocument();
    });
});
