from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            'status_code': response.status_code,
            'errors': response.data,
        }
        # Normalize 'detail' string into consistent format
        if isinstance(response.data, dict) and 'detail' in response.data:
            error_data['message'] = str(response.data['detail'])
        return Response(error_data, status=response.status_code)

    return Response(
        {'status_code': 500, 'message': 'Internal server error'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
