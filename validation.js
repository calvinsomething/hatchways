const Joi = require('joi')
    .extend(require('@joi/date'));

function ticket(req, res, next) {
    const schema = Joi.object({
        ticketId: Joi.number().integer().required(),
        flightDate: Joi.date().required(),
        seatNumber: Joi.string().max(10).required(),
        flightNumber: Joi.string().max(10).required(),
        ticketCost: Joi.number().integer().required()
    });
    const { error } = schema.validate(req.body.event);
    if (error) return res.status(400).send({ error: error.message });
    req.body.event.flightNumber = req.body.event.flightNumber.toUpperCase();
    next();
}


function dates(req, res, next) {
    const schema = Joi.object({
        startDate: Joi.date().less(Joi.ref('endDate')).format('YYYY-MM-DD').required()
            .messages(Object.assign(createReasons('startDate'), {
                'date.less': 'endDate cannot be before startDate'
            })),
        endDate: Joi.date().format('YYYY-MM-DD').required().messages(createReasons('endDate'))
    });
    const { error } = schema.validate(req.query);
    if (error) return res.status(400).send({
        status: 'failed',
        reason: error.message
    });
    next();
}

module.exports = { ticket, dates };

function createReasons(field) {
    return {
        'any.required': `${field} is empty`,
        'date.format': `${field} format is invalid`
    }
}