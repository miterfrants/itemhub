import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import DeviceForm from './device-form';

describe('<DeviceForm />', () => {
    test('it should mount', () => {
        render(<DeviceForm />);

        const deviceForm = screen.getByTestId('DeviceForm');

        expect(deviceForm).toBeInTheDocument();
    });
});
