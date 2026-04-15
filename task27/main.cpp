#include <algorithm>
#include <iostream>
#include <limits>
#include <vector>

using namespace std;

struct Person {
    long long arrival;
    long long duration;
};

static vector<Person> compress_students(const vector<Person>& students) {
    vector<Person> compressed;
    compressed.reserve(students.size());
    for (const Person& student : students) {
        while (!compressed.empty() && compressed.back().duration <= student.duration) {
            compressed.pop_back();
        }
        compressed.push_back(student);
    }
    return compressed;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int n = 0;
    int m = 0;
    cin >> n >> m;

    vector<Person> professors(n);
    vector<Person> students(m);

    for (int i = 0; i < n; ++i) {
        cin >> professors[i].arrival >> professors[i].duration;
    }
    for (int i = 0; i < m; ++i) {
        cin >> students[i].arrival >> students[i].duration;
    }

    stable_sort(
        professors.begin(),
        professors.end(),
        [](const Person& lhs, const Person& rhs) {
            return lhs.arrival < rhs.arrival;
        }
    );
    stable_sort(
        students.begin(),
        students.end(),
        [](const Person& lhs, const Person& rhs) {
            return lhs.arrival < rhs.arrival;
        }
    );
    const vector<Person> useful_students = compress_students(students);
    const int useful_count = static_cast<int>(useful_students.size());

    const long long INF = numeric_limits<long long>::max() / 4;
    vector<vector<long long>> dp_professor_end(
        n + 1, vector<long long>(useful_count + 1, INF)
    );
    vector<vector<long long>> dp_student_end(
        n + 1, vector<long long>(useful_count + 1, INF)
    );

    dp_professor_end[0][0] = 0;
    dp_student_end[0][0] = 0;

    for (int i = 0; i <= n; ++i) {
        for (int j = 0; j <= useful_count; ++j) {
            if (i > 0) {
                const Person& professor = professors[i - 1];
                long long best = INF;
                if (dp_professor_end[i - 1][j] < INF) {
                    best = min(
                        best,
                        max(dp_professor_end[i - 1][j], professor.arrival) + professor.duration
                    );
                }
                if (dp_student_end[i - 1][j] < INF) {
                    best = min(
                        best,
                        max(dp_student_end[i - 1][j], professor.arrival) + professor.duration
                    );
                }
                dp_professor_end[i][j] = best;
            }

            if (j > 0) {
                const Person& student = useful_students[j - 1];
                long long best = INF;
                if (dp_professor_end[i][j - 1] < INF) {
                    best = min(
                        best,
                        max(dp_professor_end[i][j - 1], student.arrival) + student.duration
                    );
                }
                if (dp_student_end[i][j - 1] < INF) {
                    best = min(
                        best,
                        max(dp_student_end[i][j - 1], student.arrival + student.duration)
                    );
                }
                dp_student_end[i][j] = best;
            }
        }
    }

    const long long answer = min(dp_professor_end[n][useful_count], dp_student_end[n][useful_count]);
    cout << answer << '\n';
    return 0;
}
