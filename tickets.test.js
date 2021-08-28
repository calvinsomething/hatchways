const request = require('supertest');
const app = require('./app');
const data = require('./data');

describe('POST /api/tickets', () => {  
    const postData = {
        event: {
            ticketId: 1,
            flightDate: '2021-10-01',
            flightNumber: 'AC1',
            seatNumber: '1A',
            ticketCost: 1
        }
    };

    beforeEach(() => {
        data.tickets = new Map();
        data.flights = new Map([
            ['AC1', {
                date: '2021-09-30',
                occupiedSeats: [ '2A', '3A' ],
                revenue: 2
            }]
        ]);
    });

    it('should return status 200 on successful request', async () => {
        const res = await request(app)
            .post('/api/tickets')
            .send(postData);
        expect(res.status).toBe(200);
    });

    it('should increase flight revenue by ticketCost', async () => {
        return request(app).post('/api/tickets').send(postData)
            .then(() => {
                expect(data.flights.get('AC1').revenue).toBe(3);
        });
    });

    it('should update flight date to date on ticket', async () => {
        return request(app).post('/api/tickets').send(postData)
            .then(() => {
                expect(data.flights.get('AC1').date).toMatch('2021-10-01');
        });
    });

    it('should return status 400 if ticketId already exists', async () => {
        data.tickets.set(1, {
            flightNumber: 'AC1',
            seatNumber: '1A',
            ticketCost: 1
        });
        const res = await request(app)
            .post('/api/tickets')
            .send(postData);
    });

    it('should return status 400 if seatNumber is taken', async () => {
        data.flights.set('AC1', {
            occupiedSeats: [ '1A', '2A', '3A' ],
            revenue: 3
        });
        const res = await request(app)
            .post('/api/tickets')
            .send(postData);
        expect(res.status).toBe(400);
    });
});