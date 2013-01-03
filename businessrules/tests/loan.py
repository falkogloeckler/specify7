from specify import models
from specify.api_tests import ApiTests
from ..exceptions import BusinessRuleException

class LoanTests(ApiTests):
    def test_loan_number_unique_in_discipline(self):
        models.Loan.objects.create(
            loannumber='1',
            discipline=self.discipline)

        with self.assertRaises(BusinessRuleException):
            models.Loan.objects.create(
                loannumber='1',
                discipline=self.discipline)

        models.Loan.objects.create(
            loannumber='2',
            discipline=self.discipline)
