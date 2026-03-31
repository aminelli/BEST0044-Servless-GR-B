import { Router } from 'express';

import customersController from '../controllers/customers.controller';

import { createCustomrValidationRules, queryParamsValidationRules, updateCustomrValidationRules } from '../middleware/validation';


const router = Router();


router.get('/', queryParamsValidationRules , customersController.getAllCustomers);

router.get('/:id', customersController.getCustomerById);

router.post('/', createCustomrValidationRules, customersController.createCustomer);

router.put('/:id', updateCustomrValidationRules, customersController.updateCustomer);

router.delete('/:id', customersController.deleteCustomer);



export default router;