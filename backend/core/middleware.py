import time
import logging

logger = logging.getLogger(__name__)


class RequestTimingMiddleware:
    """Log request duration for performance monitoring."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.time()
        response = self.get_response(request)
        duration_ms = int((time.time() - start) * 1000)

        logger.debug(
            'Request completed',
            extra={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': duration_ms,
            },
        )
        response['X-Response-Time-ms'] = duration_ms
        return response
