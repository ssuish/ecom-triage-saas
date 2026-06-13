from locust import HttpUser, task, between


class TicketUser(HttpUser):
    wait_time = between(0, 0.1)

    @task
    def create_ticket(self):
        self.client.post(
            "/tickets",
            json={
                "subject": "load test",
                "body": "testing rate limit",
                "customer_email": "load@example.com",
                "customer_name": "Load",
            },
            headers={"x-api-key": "test-api-key"},
        )
