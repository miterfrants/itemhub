export const Validate = {
    Email: (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    },
    MinLength: (value, min) => {
        if (!value || value.length < min) {
            return false;
        }
        return true;
    },
    Phone: (phone) => {
        const phonePattern = /^09[0-9]{8}$/;
        return phonePattern.test(phone);
    }
};
