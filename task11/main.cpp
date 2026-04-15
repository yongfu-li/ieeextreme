#include <algorithm>
#include <cstdint>
#include <iostream>
#include <limits>
#include <set>
#include <unordered_map>
#include <utility>
#include <vector>

namespace {

struct APSummaryState {
    std::vector<int> value_counts;
    std::set<int> active_values;
    std::multiset<int> gaps;
    int duplicate_values = 0;
    int total_count = 0;
};

void erase_gap(std::multiset<int>& gaps, const int gap) {
    const auto it = gaps.find(gap);
    if (it != gaps.end()) {
        gaps.erase(it);
    }
}

void remove_active_value(APSummaryState& state, const int value) {
    const auto it = state.active_values.find(value);
    if (it == state.active_values.end()) {
        return;
    }

    const auto prev_it = (it == state.active_values.begin())
                             ? state.active_values.end()
                             : std::prev(it);
    const auto next_it = std::next(it);

    if (prev_it != state.active_values.end()) {
        erase_gap(state.gaps, value - *prev_it);
    }
    if (next_it != state.active_values.end()) {
        erase_gap(state.gaps, *next_it - value);
    }
    if (prev_it != state.active_values.end() && next_it != state.active_values.end()) {
        state.gaps.insert(*next_it - *prev_it);
    }

    state.active_values.erase(it);
}

bool is_remaining_single_ap(const APSummaryState& state) {
    if (state.total_count < 2) {
        return false;
    }
    if (state.duplicate_values != 0) {
        return false;
    }
    if (state.total_count == 2) {
        return true;
    }
    if (state.gaps.empty()) {
        return false;
    }
    return *state.gaps.begin() == *state.gaps.rbegin();
}

bool apply_remove_one(
    APSummaryState& state,
    const int value,
    const std::unordered_map<int, int>& index_by_value) {
    const auto found = index_by_value.find(value);
    if (found == index_by_value.end()) {
        return false;
    }
    const int idx = found->second;
    int& cnt = state.value_counts[idx];
    if (cnt == 0) {
        return false;
    }

    if (cnt == 2) {
        --state.duplicate_values;
        cnt = 1;
    } else {
        cnt = 0;
        remove_active_value(state, value);
    }
    --state.total_count;
    return true;
}

bool find_min_len_for_ratio(
    const int first_value,
    const int ratio,
    const std::vector<int>& distinct_values,
    const std::unordered_map<int, int>& index_by_value,
    const std::vector<int>& initial_counts,
    const int initial_duplicate_values,
    const int total_n,
    int* best_len) {
    APSummaryState state;
    state.value_counts = initial_counts;
    state.duplicate_values = initial_duplicate_values;
    state.total_count = total_n;

    for (const int value : distinct_values) {
        if (state.value_counts[index_by_value.at(value)] > 0) {
            state.active_values.insert(value);
        }
    }
    if (!state.active_values.empty()) {
        auto it = state.active_values.begin();
        auto next_it = std::next(it);
        while (next_it != state.active_values.end()) {
            state.gaps.insert(*next_it - *it);
            ++it;
            ++next_it;
        }
    }

    int length = 0;
    std::int64_t current = first_value;
    while (true) {
        if (current > std::numeric_limits<int>::max()) {
            break;
        }
        if (!apply_remove_one(state, static_cast<int>(current), index_by_value)) {
            break;
        }
        ++length;
        if (length >= 2 && is_remaining_single_ap(state)) {
            *best_len = length;
            return true;
        }
        current += ratio;
    }

    return false;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int t = 0;
    std::cin >> t;

    while (t-- > 0) {
        int n = 0;
        std::cin >> n;
        std::vector<int> values(n);
        for (int i = 0; i < n; ++i) {
            std::cin >> values[i];
        }

        bool impossible = false;
        for (int i = 2; i < n; ++i) {
            if (values[i] == values[i - 2]) {
                impossible = true;
                break;
            }
        }
        if (impossible) {
            std::cout << -1 << '\n';
            continue;
        }

        std::vector<int> distinct_values;
        std::vector<int> counts;
        distinct_values.reserve(n);
        counts.reserve(n);

        for (int i = 0; i < n;) {
            int j = i;
            while (j < n && values[j] == values[i]) {
                ++j;
            }
            distinct_values.push_back(values[i]);
            counts.push_back(j - i);
            i = j;
        }

        std::unordered_map<int, int> index_by_value;
        index_by_value.reserve(static_cast<std::size_t>(2 * distinct_values.size()) + 1U);
        int duplicate_values = 0;
        for (int i = 0; i < static_cast<int>(distinct_values.size()); ++i) {
            index_by_value[distinct_values[i]] = i;
            if (counts[i] == 2) {
                ++duplicate_values;
            }
        }

        const int first = values[0];
        std::vector<int> candidate_ratios;
        candidate_ratios.reserve(128);

        const int prefix_limit = std::min(n, 80);
        for (int i = 1; i < prefix_limit; ++i) {
            const int diff = values[i] - first;
            if (diff > 0) {
                candidate_ratios.push_back(diff);
            }
        }

        const int secondary_limit = std::min(n, 10);
        for (int i = 1; i < secondary_limit; ++i) {
            for (int j = i + 1; j < secondary_limit; ++j) {
                const int qdiff = values[j] - values[i];
                if (qdiff <= 0) {
                    continue;
                }

                // Build the second progression candidate and infer ratio for first.
                std::unordered_map<int, int> temp_count;
                temp_count.reserve(static_cast<std::size_t>(2 * distinct_values.size()) + 1U);
                for (int idx = 0; idx < static_cast<int>(distinct_values.size()); ++idx) {
                    temp_count[distinct_values[idx]] = counts[idx];
                }

                int qlen = 0;
                std::int64_t cur = values[i];
                while (cur <= values.back()) {
                    auto it = temp_count.find(static_cast<int>(cur));
                    if (it == temp_count.end() || it->second == 0) {
                        break;
                    }
                    --(it->second);
                    ++qlen;
                    cur += qdiff;
                }
                if (qlen < 2) {
                    continue;
                }

                std::vector<int> rem;
                rem.reserve(n);
                for (const int x : values) {
                    auto it = temp_count.find(x);
                    if (it != temp_count.end() && it->second > 0) {
                        rem.push_back(x);
                        --(it->second);
                    }
                }
                if (static_cast<int>(rem.size()) >= 2 && rem[0] == first && rem[1] > first) {
                    candidate_ratios.push_back(rem[1] - first);
                }
            }
        }

        std::sort(candidate_ratios.begin(), candidate_ratios.end());
        candidate_ratios.erase(
            std::unique(candidate_ratios.begin(), candidate_ratios.end()),
            candidate_ratios.end());

        int answer_ratio = -1;
        int answer_len = -1;

        for (const int ratio : candidate_ratios) {
            int best_len_for_ratio = -1;
            if (find_min_len_for_ratio(
                    first,
                    ratio,
                    distinct_values,
                    index_by_value,
                    counts,
                    duplicate_values,
                    n,
                    &best_len_for_ratio)) {
                answer_ratio = ratio;
                answer_len = best_len_for_ratio;
                break;
            }
        }

        if (answer_ratio == -1) {
            std::cout << -1 << '\n';
        } else {
            std::cout << first << ' ' << answer_ratio << ' ' << answer_len << '\n';
        }
    }

    return 0;
}
