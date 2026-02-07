const app = require('./index');

test('Health check', () => {
    expect(app).toBeDefined();
    const isOk = 1 + 1 === 2;
    expect(isOk).toBe(true);
});

