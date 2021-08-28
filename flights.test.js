const request = require('supertest');
const app = require('./app');
const data = require('./data');

describe('GET /api/flights', () => {
    const query = { startDate: '', endDate: '' };
    const flights = new Map([
        ['AC1', {
            date: '2021-09-30',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }], ['BC1', {
            date: '2021-10-01',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }], ['CC1', {
            date: '2021-10-30',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }], ['DC1', {
            date: '2021-10-30',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }], ['EC1', {
            date: '2021-10-31',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }]
    ]);
    const dates = new Map([
        [ '2021-09-30', [{
            flightNumber: 'AC1',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }]], [ '2021-10-01', [{
            flightNumber: 'BC1',
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }]], [ '2021-10-30', [{
                flightNumber: 'CC1',
                occupiedSeats: [ '1A', '2A', '3A' ],
                revenue: 300000
            }, {
                flightNumber: 'DC1',
                occupiedSeats: [ '1A', '2A', '3A' ],
                revenue: 300000
        }]], [ '2021-10-31', [{
            flightNumber: 'EC1', 
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 300000
        }]]
    ]);

    beforeEach(() => {
        query.startDate = '2021-10-01';
        query.endDate = '2021-10-30';
        data.flights = flights;
        data.dates = dates;
    });

    it('should return status 200 on successful GET request', async () => {
        const res = await request(app).get('/api/flights').query(query);
        expect(res.status).toBe(200);
    });

    it('should return status 400 either date is empty', async () => {
        query.startDate = null;
        const res = await request(app).get('/api/flights').query(query);
        expect(res.status).toBe(400);
    });

    it('should return status 400 if either date is formatted incorrectly', async () => {
        query.endDate = '10-30-2021';
        const res = await request(app).get('/api/flights').query(query);
        expect(res.status).toBe(400);
    });

    it('should return status 400 if endDate is earlier than startDate', async () => {
        query.startDate = '2021-11-01';
        const res = await request(app).get('/api/flights').query(query);
        expect(res.status).toBe(400);
    });

    it('should return only flights within date range', async () => {
        const res = await request(app).get('/api/flights').query(query);
        expect(res.body.dates).toEqual(expect.not.arrayContaining([
            { date: '2021-09-30', flights: dates.get('2021-09-30') }, 
            { date: '2021-10-31', flights: dates.get('2021-10-31') }
        ]));
        expect(res.body.dates).toEqual(expect.arrayContaining([
            { date: '2021-10-01', flights: dates.get('2021-10-01') }, 
            { date: '2021-10-30', flights: dates.get('2021-10-30') }
        ]));
    });

    it('should return dates in order', async () => {
        const res = await request(app).get('/api/flights').query(query);
        expect(res.body.dates.findIndex(e => e.date === '2021-10-15'))
            .toBeLessThan(res.body.dates.findIndex(e => e.date === '2021-10-16'));
    });
});