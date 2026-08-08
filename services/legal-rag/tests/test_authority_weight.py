from src.authority_weight import compute_authority_weight


def test_luat_gets_weight_100():
    assert compute_authority_weight("luat") == 100


def test_bo_luat_gets_weight_100():
    assert compute_authority_weight("bo_luat") == 100


def test_nghi_dinh_gets_weight_90():
    assert compute_authority_weight("nghi_dinh") == 90


def test_thong_tu_gets_weight_80():
    assert compute_authority_weight("thong_tu") == 80


def test_unknown_type_gets_weight_30():
    assert compute_authority_weight("something_else") == 30
    assert compute_authority_weight(None) == 30
