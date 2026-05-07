def is_coordinator_logged_in(request):
    return (
        request.session.get("coordinator_id") is not None
        and request.session.get("role") == "coordinator"
    )
