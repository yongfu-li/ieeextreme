#include <algorithm>
#include <iostream>
#include <vector>

using namespace std;

static vector<int> permutation_after_swaps(const vector<int>& sorted_values, long long swaps) {
    const int n = static_cast<int>(sorted_values.size());
    int rem = n;
    while (rem > 1) {
        const long long segment_swaps = rem - 1;
        if (swaps >= segment_swaps) {
            swaps -= segment_swaps;
            --rem;
        } else {
            break;
        }
    }

    vector<int> result;
    result.reserve(n);

    const int fixed_prefix = n - rem;
    for (int i = 0; i < fixed_prefix; ++i) {
        result.push_back(sorted_values[n - 1 - i]);
    }

    if (rem == 0) {
        return result;
    }
    if (rem == 1) {
        result.push_back(sorted_values[0]);
        return result;
    }

    const int t = static_cast<int>(swaps);  // 0 <= t <= rem-2
    if (t == 0) {
        for (int i = 0; i < rem; ++i) {
            result.push_back(sorted_values[i]);
        }
        return result;
    }

    const int cut = rem - t - 1;
    for (int i = 0; i < cut; ++i) {
        result.push_back(sorted_values[i]);
    }
    result.push_back(sorted_values[rem - 1]);
    for (int i = cut; i <= rem - 2; ++i) {
        result.push_back(sorted_values[i]);
    }
    return result;
}

static int final_score(const vector<int>& order) {
    const int n = static_cast<int>(order.size());
    int score = 0;
    for (int i = 1; i < n; ++i) {
        if (1LL * order[i] * i > 1LL * score * n) {
            ++score;
        }
    }
    return score;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    int x = 0;
    cin >> n >> x;

    vector<int> assessments(n);
    for (int i = 0; i < n; ++i) {
        cin >> assessments[i];
    }
    sort(assessments.begin(), assessments.end());

    const long long total_swaps = 1LL * n * (n - 1) / 2;
    const vector<int> asc_order = permutation_after_swaps(assessments, 0);
    const vector<int> desc_order = permutation_after_swaps(assessments, total_swaps);
    const int max_score = final_score(asc_order);
    const int min_score = final_score(desc_order);

    long long best_swaps = 0;

    if (x >= max_score) {
        best_swaps = 0;
    } else if (x <= min_score) {
        best_swaps = total_swaps;
    } else {
        long long left = 0;
        long long right = total_swaps;
        while (left < right) {
            const long long mid = (left + right) / 2;
            const int score_mid = final_score(permutation_after_swaps(assessments, mid));
            if (score_mid <= x) {
                right = mid;
            } else {
                left = mid + 1;
            }
        }

        const long long candidate1 = left;
        const long long candidate2 = (left > 0 ? left - 1 : left);

        const int score1 = final_score(permutation_after_swaps(assessments, candidate1));
        const int score2 = final_score(permutation_after_swaps(assessments, candidate2));

        const int dist1 = abs(score1 - x);
        const int dist2 = abs(score2 - x);
        best_swaps = (dist2 <= dist1 ? candidate2 : candidate1);
    }

    const vector<int> answer = permutation_after_swaps(assessments, best_swaps);
    for (int i = 0; i < n; ++i) {
        if (i) {
            cout << ' ';
        }
        cout << answer[i];
    }
    cout << '\n';
    return 0;
}
