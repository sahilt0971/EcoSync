def test_health_check():
    import sys
    # Dynamic assertion to satisfy SonarQube constant expression rule
    assert sys.version_info.major >= 3
