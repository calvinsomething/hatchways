const express = require('express');
const { x } = require('joi');
const _ = require('lodash');
const data = require('./data');
const validate = require('./validation');

const app = express();

// Middleware
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());
app.use((err, req, res, next) => {
    res.status(500).send({error: 'Something failed.'});
});

// Routes
app.post('/api/tickets', validate.ticket, (req, res) => {
    const failure = book(req.body.event);
    if (failure) return res.status(400).send(failure);
    res.send({ status: 'success' });
});

app.get('/api/flights', validate.dates, (req, res) => {
    res.send(findFlightsInRange(req.query.startDate, req.query.endDate));
});

// Logic
function book(ticket) {
    if (data.tickets.has(ticket.ticketId)) {
        return {
            status: 'failed',
            reason: 'ticketId already exists'
        };
    }
    if (seatTaken(ticket)) {
        return {
            status: 'failed',
            reason: 'seatNumber already taken'
        };
    }
    data.tickets[ticket.ticketId] = _.pick(
        ticket,
        ['seatNumber', 'flightNumber', 'ticketCost']
    );
    updateOrCreateFlight(
        ticket.flightNumber, ticket.flightDate, ticket.seatNumber, ticket.ticketCost
    );
}

function updateOrCreateFlight(number, date, seat, cost) {
    let flight = data.flights.get(number);
    if (!flight) {
        data.flights.set(number, { date, occupiedSeats: [ seat ], revenue: cost });
        flight = data.flights.get(number);
    } else {
        flight.date = date;
        flight.occupiedSeats.push(seat);
        flight.revenue += cost;
    }
    addToDates(flight, number);
}

function addToDates(flight, flightNumber) {
    const newFlightData = { flightNumber, ..._.omit(flight, [ 'date' ]) };
    const existing = data.dates.get(flight.date);
    if (!existing) data.dates.set(flight.date, [ newFlightData ]);
    else {
        const flightIndex = existing.findIndex(e => e.flightNumber === flightNumber);
        if (flightIndex) existing[flightIndex] = newFlightData;
        else existing.push(newFlightData);
    }
}

function seatTaken(ticket) {
    const flight = data.flights.get(ticket.flightNumber);
    if (!flight) return false;
    for (seat of flight.occupiedSeats) {
        if (ticket.seatNumber === seat) return true;
    }
}

function findFlightsInRange(start, end) {
    const dates = [];
    const s = new Date(start);
    const e = new Date(end);
    while (s <= e) {
        const date = { date: s.toJSON().split('T')[0] };
        const flights = data.dates.get(date.date);
        if (flights) date.flights = flights;
        dates.push(date);
        s.setDate(s.getDate() + 1);
    }
    return { dates };
};

module.exports = app;