from src.category_mapping import map_legal_sectors, map_linh_vuc, map_vbpl_legal_area


def test_map_vbpl_real_estate():
    cats, reason = map_vbpl_legal_area("Đất đai")
    assert cats == ["RealEstate"]
    assert reason is None


def test_map_vbpl_unclassified():
    cats, reason = map_vbpl_legal_area("Chưa phân loại")
    assert cats == []
    assert reason == "unclassified"


def test_map_vbpl_out_of_scope():
    cats, reason = map_vbpl_legal_area("Thi đua khen thưởng")
    assert cats == []
    assert reason == "out_of_scope"


def test_map_legacy_multi_category():
    cats, reason = map_legal_sectors("Employment - Wages, Administrative apparatus")
    assert cats == ["Administrative", "Labor"]
    assert reason is None
